const express = require('express');
const fs = require('fs');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const uploadExamSubmission = require('../middleware/uploadExamSubmission');

const router = express.Router();

// Pure check: does `lecturerRow` (this user's lecturer record for the exam's course, or null) grant edit rights?
function lecturerCoversModule(lecturerRow, exam) {
  if (!lecturerRow) return false;
  if (!exam.module) return true;
  let modules = [];
  try { modules = JSON.parse(lecturerRow.modules || '[]'); } catch (e) { modules = []; }
  return modules.some(m => m.module === exam.module);
}

// Can this user manage the exam (edit its deadline, view/grade its submissions)?
function canManageExamSync(user, exam, lecturerRow) {
  if (user.role === 'admin') return true;
  if (user.role !== 'instructor') return false;
  if (exam.instructor_id === user.id) return true;
  return lecturerCoversModule(lecturerRow, exam);
}

async function canManageExam(user, exam) {
  if (user.role === 'admin') return true;
  if (user.role !== 'instructor') return false;
  if (exam.instructor_id === user.id) return true;
  const [lecturer] = await query('SELECT * FROM lecturers WHERE user_id = ? AND course_id = ?', [user.id, exam.course_id]);
  return lecturerCoversModule(lecturer, exam);
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { course_id, module, batch } = req.query;
  const clauses = [];
  const params = [];
  if (course_id) { clauses.push('e.course_id = ?'); params.push(course_id); }
  if (module) { clauses.push('e.module = ?'); params.push(module); }
  if (batch) { clauses.push('e.batch = ?'); params.push(batch); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  let rows = await query(`
    SELECT e.*, c.name AS course_name,
      (SELECT COUNT(*) FROM exam_submissions s WHERE s.exam_id = e.id) AS submission_count
    FROM exams e
    LEFT JOIN courses c ON c.id = e.course_id
    ${where}
    ORDER BY e.created_at DESC
  `, params);

  let myLecturerRows = [];
  if (req.user.role === 'instructor') {
    myLecturerRows = await query('SELECT course_id, modules FROM lecturers WHERE user_id = ?', [req.user.id]);
    rows = rows.filter(e => {
      if (e.instructor_id === req.user.id) return true;
      const lecturerRow = myLecturerRows.find(l => l.course_id === e.course_id);
      return lecturerCoversModule(lecturerRow, e);
    });
  }
  rows.forEach(e => {
    const lecturerRow = myLecturerRows.find(l => l.course_id === e.course_id);
    e.can_edit_deadline = canManageExamSync(req.user, e, lecturerRow);
  });

  if (req.user.role === 'student') {
    // A student only ever sees exams untagged (batch = NULL, applies to everyone) or tagged with
    // their own batch - never another cohort's exam for the same course.
    const [myStudent] = await query('SELECT batch FROM students WHERE user_id = ?', [req.user.id]);
    if (myStudent) rows = rows.filter(e => !e.batch || e.batch === myStudent.batch);

    const mySubs = await query(
      'SELECT exam_id, grade, feedback, submitted_at, file_path, file_name FROM exam_submissions WHERE student_user_id = ?',
      [req.user.id]
    );
    const subMap = Object.fromEntries(mySubs.map(s => [s.exam_id, s]));
    rows.forEach(r => {
      const sub = subMap[r.id];
      r.my_submission = !!sub;
      r.my_grade = sub ? sub.grade : null;
      r.my_feedback = sub ? sub.feedback : null;
      r.my_submission_file = sub ? sub.file_path : null;
      r.my_submission_file_name = sub ? sub.file_name : null;
    });
  }
  res.json({ exams: rows });
}));

router.post('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { title, course_id, module, start_at, end_at, batch } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });

  if (req.user.role === 'instructor') {
    const [lecturerRow] = await query('SELECT * FROM lecturers WHERE user_id = ? AND course_id = ?', [req.user.id, course_id || null]);
    if (!lecturerCoversModule(lecturerRow, { module: module || null })) {
      return res.status(403).json({ error: 'You can only open an exam portal for a course and module you are assigned to teach.' });
    }
  }

  const info = await run(
    `INSERT INTO exams (title, course_id, module, instructor_id, start_at, end_at, batch) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title.trim(), course_id || null, module || null, req.user.id, start_at || null, end_at || null, batch || null]
  );
  const [exam] = await query('SELECT * FROM exams WHERE id = ?', [info.lastInsertRowid]);
  res.status(201).json({ exam });
}));

router.put('/:id/deadline', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [exam] = await query('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  const { end_at } = req.body || {};
  if (!end_at) return res.status(400).json({ error: 'end_at is required' });

  if (!(await canManageExam(req.user, exam))) {
    return res.status(403).json({ error: 'You are not permitted to change this exam\'s deadline' });
  }

  await run('UPDATE exams SET end_at = ? WHERE id = ?', [end_at, exam.id]);
  const [updated] = await query('SELECT * FROM exams WHERE id = ?', [exam.id]);
  res.json({ exam: updated });
}));

router.post('/:id/submit', requireAuth, requireRole('student'), uploadExamSubmission.single('file'), asyncHandler(async (req, res) => {
  const [exam] = await query('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  if (exam.end_at && new Date() > new Date(exam.end_at)) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(403).json({ error: 'The submission window for this exam has closed.' });
  }
  if (!req.file) return res.status(400).json({ error: 'Please attach a photo or PDF of your exam paper' });

  const filePath = `/uploads/exam-submissions/${req.file.filename}`;
  const fileName = req.file.originalname;

  await run(`
    INSERT INTO exam_submissions (exam_id, student_user_id, file_path, file_name, submitted_at)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), file_name = VALUES(file_name),
      submitted_at = NOW(), grade = NULL, feedback = NULL
  `, [exam.id, req.user.id, filePath, fileName]);

  res.status(201).json({ message: 'Exam paper submitted' });
}));

router.get('/:id/submissions', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [exam] = await query('SELECT e.*, c.name AS course_name FROM exams e LEFT JOIN courses c ON c.id = e.course_id WHERE e.id = ?', [req.params.id]);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  if (!(await canManageExam(req.user, exam))) {
    return res.status(403).json({ error: 'You can only view submissions for a course and module you are assigned to teach.' });
  }

  const rows = await query(`
    SELECT s.*, u.name AS student_name FROM exam_submissions s
    JOIN users u ON u.id = s.student_user_id
    WHERE s.exam_id = ? ORDER BY s.submitted_at DESC
  `, [req.params.id]);

  res.json({ exam, submissions: rows });
}));

router.put('/:id/submissions/:subId/grade', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [exam] = await query('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  if (!(await canManageExam(req.user, exam))) {
    return res.status(403).json({ error: 'You can only grade submissions for a course and module you are assigned to teach.' });
  }

  const { grade, feedback } = req.body || {};
  const info = await run('UPDATE exam_submissions SET grade = ?, feedback = ? WHERE id = ? AND exam_id = ?',
    [grade || null, feedback || null, req.params.subId, req.params.id]);
  if (info.changes === 0) return res.status(404).json({ error: 'Submission not found' });
  res.json({ message: 'Grade saved' });
}));

module.exports = router;
