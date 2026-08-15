const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../db');
const { requireAuth, requireRole, JWT_SECRET } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const uploadCourseLogo = require('../middleware/uploadCourseLogo');

const router = express.Router();

async function issueCertificateIfNeeded(userId, courseId) {
  const [existing] = await query('SELECT * FROM certificates WHERE user_id = ? AND course_id = ?', [userId, courseId]);
  if (existing) return existing;
  const code = 'VTA-QS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const info = await run('INSERT INTO certificates (user_id, course_id, cert_code) VALUES (?, ?, ?)', [userId, courseId, code]);
  const [cert] = await query('SELECT * FROM certificates WHERE id = ?', [info.lastInsertRowid]);
  return cert;
}

// List all courses in the catalogue, with enrollment/progress info for the current user if logged in
router.get('/', asyncHandler(async (req, res) => {
  const courses = await query('SELECT * FROM courses ORDER BY id');
  let enrollMap = {};
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const user = jwt.verify(token, JWT_SECRET);
      const rows = await query('SELECT course_id, progress FROM enrollments WHERE user_id = ?', [user.id]);
      rows.forEach(r => { enrollMap[r.course_id] = r.progress; });
    } catch (e) { /* not logged in / invalid token: treat as anonymous */ }
  }
  const result = courses.map(c => ({
    ...c,
    enrolled: Object.prototype.hasOwnProperty.call(enrollMap, c.id),
    progress: enrollMap[c.id] || 0,
  }));
  res.json({ courses: result });
}));

function cleanModuleList(list) {
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch (e) { list = []; }
  }
  if (!Array.isArray(list)) return [];
  return list
    .map(m => ({ module: (m && m.module || '').trim(), code: (m && m.code || '').trim() }))
    .filter(m => m.module || m.code);
}

function courseFieldsFromBody(body, existing = {}) {
  const {
    name, description, icon, duration,
    study_mode, qualification_type,
    sem1_modules, sem2_modules,
    modules, instructor,
  } = body || {};

  const studyMode = ['Full Time', 'Part Time'].includes(study_mode) ? study_mode : 'Full Time';
  const qualificationType = ['NVQ-05', 'Non-NVQ'].includes(qualification_type) ? qualification_type : 'NVQ-05';
  const isNvq = qualificationType === 'NVQ-05';
  const parsedDuration = duration !== undefined && duration !== '' ? Number(duration) : null;

  return {
    name: name ? name.trim() : '',
    description: description !== undefined ? description : (existing.description || ''),
    icon: icon || existing.icon || 'fa-book-open',
    duration: Number.isFinite(parsedDuration) ? parsedDuration : (existing.duration ?? null),
    studyMode,
    qualificationType,
    sem1Modules: isNvq ? JSON.stringify(cleanModuleList(sem1_modules)) : null,
    sem2Modules: isNvq ? JSON.stringify(cleanModuleList(sem2_modules)) : null,
    modules: isNvq ? null : JSON.stringify(cleanModuleList(modules)),
    instructor: instructor || '',
  };
}

router.post('/', requireAuth, requireRole('instructor', 'admin'), uploadCourseLogo.single('logo'), asyncHandler(async (req, res) => {
  if (!req.body || !req.body.name) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'name is required' });
  }
  const f = courseFieldsFromBody(req.body);
  const logoUrl = req.file ? `/uploads/courses/${req.file.filename}` : null;

  const info = await run(
    `INSERT INTO courses
      (name, description, icon, duration, logo_url, study_mode, qualification_type, sem1_modules, sem2_modules, modules, instructor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [f.name, f.description, f.icon, f.duration, logoUrl, f.studyMode, f.qualificationType, f.sem1Modules, f.sem2Modules, f.modules, f.instructor]
  );
  const [course] = await query('SELECT * FROM courses WHERE id = ?', [info.lastInsertRowid]);
  res.status(201).json({ course });
}));

router.put('/:id', requireAuth, requireRole('instructor', 'admin'), uploadCourseLogo.single('logo'), asyncHandler(async (req, res) => {
  const courseId = Number(req.params.id);
  const [existing] = await query('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!existing) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: 'Course not found' });
  }
  if (!req.body || !req.body.name) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'name is required' });
  }
  const f = courseFieldsFromBody(req.body, existing);
  const logoUrl = req.file ? `/uploads/courses/${req.file.filename}` : existing.logo_url;

  await run(
    `UPDATE courses SET name = ?, description = ?, icon = ?, duration = ?, logo_url = ?, study_mode = ?, qualification_type = ?,
      sem1_modules = ?, sem2_modules = ?, modules = ?, instructor = ? WHERE id = ?`,
    [f.name, f.description, f.icon, f.duration, logoUrl, f.studyMode, f.qualificationType, f.sem1Modules, f.sem2Modules, f.modules, f.instructor, courseId]
  );
  if (req.file && existing.logo_url) fs.unlink(`${__dirname}/../../public${existing.logo_url}`, () => {});
  const [course] = await query('SELECT * FROM courses WHERE id = ?', [courseId]);
  res.json({ course });
}));

router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const courseId = Number(req.params.id);
  const [existing] = await query('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!existing) return res.status(404).json({ error: 'Course not found' });
  await run('DELETE FROM courses WHERE id = ?', [courseId]);
  if (existing.logo_url) fs.unlink(`${__dirname}/../../public${existing.logo_url}`, () => {});
  res.json({ message: 'Course removed' });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT c.*, e.progress FROM enrollments e JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = ? ORDER BY e.enrolled_at DESC
  `, [req.user.id]);
  res.json({ courses: rows });
}));

// Aggregate counts only (no student/lecturer PII) - safe for any authenticated role, including students.
router.get('/:id/summary', requireAuth, asyncHandler(async (req, res) => {
  const courseId = Number(req.params.id);
  let sql = `
    SELECT COUNT(DISTINCT s.id) AS n FROM students s
    JOIN enrollments e ON e.user_id = s.user_id
    WHERE e.course_id = ?
  `;
  const params = [courseId];
  // A student only ever sees their own batch's headcount, not the whole course across every intake -
  // same "own batch always wins" rule applied to the assignment/exam/result list pages.
  if (req.user.role === 'student') {
    const [myStudent] = await query('SELECT batch FROM students WHERE user_id = ?', [req.user.id]);
    if (myStudent) { sql += ' AND s.batch = ?'; params.push(myStudent.batch); }
  }
  const [{ n: studentCount }] = await query(sql, params);
  const [{ n: lecturerCount }] = await query('SELECT COUNT(*) AS n FROM lecturers WHERE course_id = ?', [courseId]);
  res.json({ studentCount, lecturerCount });
}));

// Name + modules only (no lecturer_id/photo/email) - safe for any authenticated role, including students.
router.get('/:id/lecturers', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query('SELECT name, modules FROM lecturers WHERE course_id = ?', [Number(req.params.id)]);
  res.json({ lecturers: rows });
}));

// id + name + batch + MIS number + photo only (no NIC) - safe for classmates to see each other.
// is_me is computed server-side so the caller's own row can be highlighted without ever exposing raw user_id values for classmates.
// A student caller only ever sees classmates in their own batch/year, not the whole course across every intake.
router.get('/:id/students', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT s.id, s.name, s.batch, s.mis_no, s.photo_url, s.user_id FROM students s
    JOIN enrollments e ON e.user_id = s.user_id
    WHERE e.course_id = ?
    ORDER BY s.name
  `, [Number(req.params.id)]);

  let visible = rows;
  if (req.user.role === 'student') {
    const [caller] = await query('SELECT batch FROM students WHERE user_id = ?', [req.user.id]);
    if (caller) visible = rows.filter(s => s.batch === caller.batch);
  }

  const result = visible.map(({ user_id, ...rest }) => ({ ...rest, is_me: user_id === req.user.id }));
  res.json({ students: result });
}));

router.post('/:id/enroll', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const courseId = Number(req.params.id);
  const [course] = await query('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const [existing] = await query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, courseId]);
  if (existing) return res.status(409).json({ error: 'Already enrolled in this course' });

  await run('INSERT INTO enrollments (user_id, course_id, progress) VALUES (?, ?, 0)', [req.user.id, courseId]);
  res.status(201).json({ message: `Enrolled in ${course.name}` });
}));

router.post('/:id/progress', requireAuth, asyncHandler(async (req, res) => {
  const courseId = Number(req.params.id);
  const { progress } = req.body || {};
  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'progress must be a number between 0 and 100' });
  }
  const [enrollment] = await query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, courseId]);
  if (!enrollment) return res.status(404).json({ error: 'Not enrolled in this course' });

  const clamped = Math.min(100, Math.max(enrollment.progress, progress));
  await run('UPDATE enrollments SET progress = ? WHERE id = ?', [clamped, enrollment.id]);

  let certificate = null;
  if (clamped >= 100) {
    certificate = await issueCertificateIfNeeded(req.user.id, courseId);
  }
  res.json({ progress: clamped, certificate });
}));

module.exports = router;
