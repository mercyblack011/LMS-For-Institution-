const express = require('express');
const fs = require('fs');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const uploadAssignment = require('../middleware/uploadAssignment');
const uploadSubmission = require('../middleware/uploadSubmission');

const router = express.Router();

// Pure check: does `lecturerRow` (this user's lecturer record for the assignment's course, or null) grant edit rights?
function lecturerCoversModule(lecturerRow, assignment) {
  if (!lecturerRow) return false;
  if (!assignment.module) return true;
  let modules = [];
  try { modules = JSON.parse(lecturerRow.modules || '[]'); } catch (e) { modules = []; }
  return modules.some(m => m.module === assignment.module);
}

// Can this user manage the assignment (edit its deadline, view/grade its submissions)?
function canManageAssignmentSync(user, assignment, lecturerRow) {
  if (user.role === 'admin') return true;
  if (user.role !== 'instructor') return false;
  if (assignment.instructor_id === user.id) return true;
  return lecturerCoversModule(lecturerRow, assignment);
}

async function canManageAssignment(user, assignment) {
  if (user.role === 'admin') return true;
  if (user.role !== 'instructor') return false;
  if (assignment.instructor_id === user.id) return true;
  const [lecturer] = await query('SELECT * FROM lecturers WHERE user_id = ? AND course_id = ?', [user.id, assignment.course_id]);
  return lecturerCoversModule(lecturer, assignment);
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { course_id, module, batch } = req.query;
  const clauses = [];
  const params = [];
  if (course_id) { clauses.push('a.course_id = ?'); params.push(course_id); }
  if (module) { clauses.push('a.module = ?'); params.push(module); }
  if (batch) { clauses.push('a.batch = ?'); params.push(batch); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  let rows = await query(`
    SELECT a.*, c.name AS course_name,
      (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) AS submission_count
    FROM assignments a
    LEFT JOIN courses c ON c.id = a.course_id
    ${where}
    ORDER BY a.created_at DESC
  `, params);

  let myLecturerRows = [];
  if (req.user.role === 'instructor') {
    myLecturerRows = await query('SELECT course_id, modules FROM lecturers WHERE user_id = ?', [req.user.id]);
    // A lecturer only accesses assignments for courses/modules they're actually assigned to teach
    // (their own creations are always included as a safety net for legacy data).
    rows = rows.filter(a => {
      if (a.instructor_id === req.user.id) return true;
      const lecturerRow = myLecturerRows.find(l => l.course_id === a.course_id);
      return lecturerCoversModule(lecturerRow, a);
    });
  }
  rows.forEach(a => {
    const lecturerRow = myLecturerRows.find(l => l.course_id === a.course_id);
    a.can_edit_deadline = canManageAssignmentSync(req.user, a, lecturerRow);
  });

  if (req.user.role === 'student') {
    // A student only ever sees assignments untagged (batch = NULL, applies to everyone) or tagged
    // with their own batch - never another cohort's assignments for the same course.
    const [myStudent] = await query('SELECT batch FROM students WHERE user_id = ?', [req.user.id]);
    if (myStudent) rows = rows.filter(a => !a.batch || a.batch === myStudent.batch);

    const mySubs = await query(
      'SELECT assignment_id, grade, feedback, submitted_at, file_path, file_name FROM submissions WHERE student_user_id = ?',
      [req.user.id]
    );
    const subMap = Object.fromEntries(mySubs.map(s => [s.assignment_id, s]));
    rows.forEach(r => {
      const sub = subMap[r.id];
      r.my_submission = !!sub;
      r.my_grade = sub ? sub.grade : null;
      r.my_feedback = sub ? sub.feedback : null;
      r.my_submission_file = sub ? sub.file_path : null;
      r.my_submission_file_name = sub ? sub.file_name : null;
    });
  }
  res.json({ assignments: rows });
}));

router.post('/', requireAuth, requireRole('instructor', 'admin'), uploadAssignment.single('file'), asyncHandler(async (req, res) => {
  const { title, course_id, module, start_at, end_at, instructions, batch } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });

  if (req.user.role === 'instructor') {
    const [lecturerRow] = await query('SELECT * FROM lecturers WHERE user_id = ? AND course_id = ?', [req.user.id, course_id || null]);
    if (!lecturerCoversModule(lecturerRow, { module: module || null })) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(403).json({ error: 'You can only create assignments for a course and module you are assigned to teach.' });
    }
  }

  const filePath = req.file ? `/uploads/assignments/${req.file.filename}` : null;
  const fileName = req.file ? req.file.originalname : null;

  const info = await run(
    `INSERT INTO assignments (title, course_id, module, instructor_id, start_at, end_at, instructions, file_path, file_name, batch)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title.trim(), course_id || null, module || null, req.user.id, start_at || null, end_at || null, instructions || '', filePath, fileName, batch || null]
  );
  const [assignment] = await query('SELECT * FROM assignments WHERE id = ?', [info.lastInsertRowid]);
  res.status(201).json({ assignment });
}));

router.put('/:id/deadline', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [assignment] = await query('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  const { end_at } = req.body || {};
  if (!end_at) return res.status(400).json({ error: 'end_at is required' });

  if (!(await canManageAssignment(req.user, assignment))) {
    return res.status(403).json({ error: 'You are not permitted to change this assignment\'s deadline' });
  }

  await run('UPDATE assignments SET end_at = ? WHERE id = ?', [end_at, assignment.id]);
  const [updated] = await query('SELECT * FROM assignments WHERE id = ?', [assignment.id]);
  res.json({ assignment: updated });
}));

router.post('/:id/submit', requireAuth, requireRole('student'), uploadSubmission.single('file'), asyncHandler(async (req, res) => {
  const [assignment] = await query('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  if (assignment.end_at && new Date() > new Date(assignment.end_at)) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(403).json({ error: 'The deadline for this assignment has passed. Submissions are closed.' });
  }
  if (!req.file) return res.status(400).json({ error: 'Please attach a PDF or image of your work' });

  const { note } = req.body || {};
  const filePath = `/uploads/submissions/${req.file.filename}`;
  const fileName = req.file.originalname;

  await run(`
    INSERT INTO submissions (assignment_id, student_user_id, note, file_path, file_name, submitted_at)
    VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE note = VALUES(note), file_path = VALUES(file_path), file_name = VALUES(file_name),
      submitted_at = NOW(), grade = NULL, feedback = NULL
  `, [assignment.id, req.user.id, note || '', filePath, fileName]);

  res.status(201).json({ message: 'Submission recorded' });
}));

router.get('/:id/submissions', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [assignment] = await query('SELECT a.*, c.name AS course_name FROM assignments a LEFT JOIN courses c ON c.id = a.course_id WHERE a.id = ?', [req.params.id]);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (!(await canManageAssignment(req.user, assignment))) {
    return res.status(403).json({ error: 'You can only view submissions for a course and module you are assigned to teach.' });
  }

  const rows = await query(`
    SELECT s.*, u.name AS student_name FROM submissions s
    JOIN users u ON u.id = s.student_user_id
    WHERE s.assignment_id = ? ORDER BY s.submitted_at DESC
  `, [req.params.id]);

  res.json({ assignment, submissions: rows });
}));

router.put('/:id/submissions/:subId/grade', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [assignment] = await query('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (!(await canManageAssignment(req.user, assignment))) {
    return res.status(403).json({ error: 'You can only grade submissions for a course and module you are assigned to teach.' });
  }

  const { grade, feedback } = req.body || {};
  const info = await run('UPDATE submissions SET grade = ?, feedback = ? WHERE id = ? AND assignment_id = ?',
    [grade || null, feedback || null, req.params.subId, req.params.id]);
  if (info.changes === 0) return res.status(404).json({ error: 'Submission not found' });
  res.json({ message: 'Grade saved' });
}));

module.exports = router;
