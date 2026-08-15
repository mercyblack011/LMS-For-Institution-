const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../middleware/uploadLecturer');

const router = express.Router();

const LECTURER_SELECT = `
  SELECT l.*, c.name AS course_name
  FROM lecturers l LEFT JOIN courses c ON c.id = l.course_id
`;

function cleanModules(json) {
  let list;
  try { list = JSON.parse(json || '[]'); } catch (e) { list = []; }
  if (!Array.isArray(list)) return [];
  return list
    .map(m => ({ module: (m && m.module || '').trim(), code: (m && m.code || '').trim() }))
    .filter(m => m.module);
}

router.get('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const rows = await query(`${LECTURER_SELECT} ORDER BY l.id`);
  res.json({ lecturers: rows });
}));

router.post('/', requireAuth, requireRole('admin'), upload.single('photo'), asyncHandler(async (req, res) => {
  const { name, lecturer_id, course_id, modules, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

  const cleanEmail = email.toLowerCase().trim();
  const [existingUser] = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
  if (existingUser) return res.status(409).json({ error: 'An account with this email already exists' });

  let courseId = course_id ? Number(course_id) : null;
  if (courseId) {
    const [course] = await query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) return res.status(404).json({ error: 'Selected course not found' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const userInfo = await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name.trim(), cleanEmail, hash, 'instructor']);
  const userId = userInfo.lastInsertRowid;

  const photoUrl = req.file ? `/uploads/lecturers/${req.file.filename}` : null;
  const lecturerInfo = await run(
    'INSERT INTO lecturers (user_id, name, lecturer_id, course_id, modules, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name.trim(), lecturer_id || '', courseId, JSON.stringify(cleanModules(modules)), photoUrl]
  );

  const [lecturer] = await query(`${LECTURER_SELECT} WHERE l.id = ?`, [lecturerInfo.lastInsertRowid]);
  res.status(201).json({ lecturer });
}));

router.put('/:id', requireAuth, requireRole('admin'), upload.single('photo'), asyncHandler(async (req, res) => {
  const [lecturer] = await query('SELECT * FROM lecturers WHERE id = ?', [req.params.id]);
  if (!lecturer) return res.status(404).json({ error: 'Lecturer not found' });

  const { name, lecturer_id, course_id, modules } = req.body || {};

  let courseId = lecturer.course_id;
  if (course_id !== undefined) {
    courseId = course_id ? Number(course_id) : null;
    if (courseId) {
      const [course] = await query('SELECT id FROM courses WHERE id = ?', [courseId]);
      if (!course) return res.status(404).json({ error: 'Selected course not found' });
    }
  }

  const photoUrl = req.file ? `/uploads/lecturers/${req.file.filename}` : lecturer.photo_url;
  const modulesJson = modules !== undefined ? JSON.stringify(cleanModules(modules)) : lecturer.modules;

  await run('UPDATE lecturers SET name = ?, lecturer_id = ?, course_id = ?, modules = ?, photo_url = ? WHERE id = ?', [
    name ?? lecturer.name, lecturer_id ?? lecturer.lecturer_id, courseId, modulesJson, photoUrl, lecturer.id,
  ]);
  const [updated] = await query(`${LECTURER_SELECT} WHERE l.id = ?`, [lecturer.id]);
  res.json({ lecturer: updated });
}));

router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const info = await run('DELETE FROM lecturers WHERE id = ?', [req.params.id]);
  if (info.changes === 0) return res.status(404).json({ error: 'Lecturer not found' });
  res.json({ message: 'Lecturer removed' });
}));

module.exports = router;
