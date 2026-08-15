const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../middleware/upload');

const router = express.Router();

const STUDENT_SELECT = `
  SELECT s.*,
    (SELECT c.name FROM enrollments e JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = s.user_id ORDER BY e.enrolled_at DESC, e.id DESC LIMIT 1) AS course_name,
    (SELECT e.course_id FROM enrollments e
     WHERE e.user_id = s.user_id ORDER BY e.enrolled_at DESC, e.id DESC LIMIT 1) AS course_id
  FROM students s
`;

// Distinct batch/year values from the students table, sorted with the highest number (the most
// recent intake year) first. Non-numeric legacy values (e.g. "NVQ-5") sort after the numeric ones.
router.get('/batches', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const rows = await query("SELECT DISTINCT batch FROM students WHERE batch IS NOT NULL AND batch <> ''");
  const values = rows.map(r => r.batch);
  const numeric = values.filter(b => !isNaN(Number(b))).sort((a, b) => Number(b) - Number(a));
  const nonNumeric = values.filter(b => isNaN(Number(b))).sort();
  res.json({ batches: [...numeric, ...nonNumeric], latest: numeric[0] || nonNumeric[0] || null });
}));

router.get('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { course_id, batch } = req.query;
  let rows = await query(`${STUDENT_SELECT} ORDER BY s.id DESC`);
  if (req.user.role === 'instructor') {
    const myCourses = await query('SELECT DISTINCT course_id FROM lecturers WHERE user_id = ? AND course_id IS NOT NULL', [req.user.id]);
    const myCourseIds = new Set(myCourses.map(r => r.course_id));
    rows = rows.filter(s => myCourseIds.has(s.course_id));
  }
  if (course_id) rows = rows.filter(s => String(s.course_id) === String(course_id));
  if (batch) rows = rows.filter(s => (s.batch || '').toLowerCase().includes(batch.toLowerCase()));
  res.json({ students: rows });
}));

router.post('/', requireAuth, requireRole('admin'), upload.single('photo'), asyncHandler(async (req, res) => {
  const { name, nic, batch, mis_no, course_id, email, password } = req.body || {};
  if (!name || !email || !password || !course_id) {
    return res.status(400).json({ error: 'name, email, password and course_id are required' });
  }
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

  const cleanEmail = email.toLowerCase().trim();
  const [existingUser] = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
  if (existingUser) return res.status(409).json({ error: 'An account with this email already exists' });

  const [course] = await query('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) return res.status(404).json({ error: 'Selected course not found' });

  const hash = bcrypt.hashSync(password, 10);
  const userInfo = await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name.trim(), cleanEmail, hash, 'student']);
  const userId = userInfo.lastInsertRowid;

  const photoUrl = req.file ? `/uploads/students/${req.file.filename}` : null;
  const studentInfo = await run('INSERT INTO students (user_id, name, nic, batch, mis_no, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name.trim(), nic || null, batch || 'NVQ-5', mis_no || null, photoUrl]);

  await run('INSERT INTO enrollments (user_id, course_id, progress) VALUES (?, ?, 0)', [userId, course_id]);

  const [student] = await query(`${STUDENT_SELECT} WHERE s.id = ?`, [studentInfo.lastInsertRowid]);
  res.status(201).json({ student });
}));

router.put('/:id', requireAuth, requireRole('admin'), upload.single('photo'), asyncHandler(async (req, res) => {
  const [student] = await query('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { name, nic, batch, mis_no, course_id } = req.body || {};

  if (course_id) {
    if (!student.user_id) {
      return res.status(400).json({ error: 'This student has no linked login account to enroll.' });
    }
    const [course] = await query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (!course) return res.status(404).json({ error: 'Selected course not found' });

    await run(`
      INSERT INTO enrollments (user_id, course_id, progress) VALUES (?, ?, 0)
      ON DUPLICATE KEY UPDATE enrolled_at = NOW()
    `, [student.user_id, course_id]);
  }

  const photoUrl = req.file ? `/uploads/students/${req.file.filename}` : student.photo_url;

  await run('UPDATE students SET name = ?, nic = ?, batch = ?, mis_no = ?, photo_url = ? WHERE id = ?', [
    name ?? student.name, nic ?? student.nic, batch ?? student.batch, mis_no ?? student.mis_no, photoUrl, student.id,
  ]);
  const [updated] = await query(`${STUDENT_SELECT} WHERE s.id = ?`, [student.id]);
  res.json({ student: updated });
}));

router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const info = await run('DELETE FROM students WHERE id = ?', [req.params.id]);
  if (info.changes === 0) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student removed' });
}));

module.exports = router;
