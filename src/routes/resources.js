const express = require('express');
const fs = require('fs');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const uploadResource = require('../middleware/uploadResource');

const router = express.Router();

function lecturerCoversModule(lecturerRow, resource) {
  if (!lecturerRow) return false;
  if (!resource.module) return true;
  let modules = [];
  try { modules = JSON.parse(lecturerRow.modules || '[]'); } catch (e) { modules = []; }
  return modules.some(m => m.module === resource.module);
}

async function canManageResource(user, resource) {
  if (user.role === 'admin') return true;
  if (user.role !== 'instructor') return false;
  if (resource.uploaded_by === user.id) return true;
  const [lecturer] = await query('SELECT * FROM lecturers WHERE user_id = ? AND course_id = ?', [user.id, resource.course_id]);
  return lecturerCoversModule(lecturer, resource);
}

// Visible to everyone logged in - students included. Filterable by type/course/module.
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { type, course_id, module } = req.query;
  const clauses = [];
  const params = [];
  if (type) { clauses.push('r.type = ?'); params.push(type); }
  if (course_id) { clauses.push('r.course_id = ?'); params.push(course_id); }
  if (module) { clauses.push('r.module = ?'); params.push(module); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const rows = await query(`
    SELECT r.*, c.name AS course_name, u.name AS uploaded_by_name
    FROM resources r
    LEFT JOIN courses c ON c.id = r.course_id
    JOIN users u ON u.id = r.uploaded_by
    ${where}
    ORDER BY r.created_at DESC
  `, params);

  let myLecturerRows = [];
  if (req.user.role === 'instructor') {
    myLecturerRows = await query('SELECT course_id, modules FROM lecturers WHERE user_id = ?', [req.user.id]);
  }
  rows.forEach(r => {
    if (req.user.role === 'admin') { r.can_delete = true; return; }
    if (req.user.role !== 'instructor') { r.can_delete = false; return; }
    if (r.uploaded_by === req.user.id) { r.can_delete = true; return; }
    const lecturerRow = myLecturerRows.find(l => l.course_id === r.course_id);
    r.can_delete = lecturerCoversModule(lecturerRow, r);
  });

  res.json({ resources: rows });
}));

router.post('/', requireAuth, requireRole('instructor', 'admin'), uploadResource.single('file'), asyncHandler(async (req, res) => {
  const { type, course_id, module, unit_name } = req.body || {};
  if (!['notes', 'past_paper'].includes(type)) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'type must be notes or past_paper' });
  }
  if (!unit_name) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'unit_name is required' });
  }
  if (!req.file) return res.status(400).json({ error: 'Please attach a PDF file' });

  if (req.user.role === 'instructor') {
    const [lecturerRow] = await query('SELECT * FROM lecturers WHERE user_id = ? AND course_id = ?', [req.user.id, course_id || null]);
    if (!lecturerCoversModule(lecturerRow, { module: module || null })) {
      fs.unlink(req.file.path, () => {});
      return res.status(403).json({ error: 'You can only upload files for a course and module you are assigned to teach.' });
    }
  }

  const filePath = `/uploads/resources/${req.file.filename}`;
  const fileName = req.file.originalname;

  const info = await run(
    `INSERT INTO resources (type, course_id, module, unit_name, file_path, file_name, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [type, course_id || null, module || null, unit_name.trim(), filePath, fileName, req.user.id]
  );
  const [resource] = await query(`
    SELECT r.*, c.name AS course_name, u.name AS uploaded_by_name
    FROM resources r LEFT JOIN courses c ON c.id = r.course_id JOIN users u ON u.id = r.uploaded_by
    WHERE r.id = ?
  `, [info.lastInsertRowid]);
  res.status(201).json({ resource });
}));

router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [resource] = await query('SELECT * FROM resources WHERE id = ?', [req.params.id]);
  if (!resource) return res.status(404).json({ error: 'File not found' });
  if (!(await canManageResource(req.user, resource))) {
    return res.status(403).json({ error: 'You can only remove files for a course and module you are assigned to teach.' });
  }
  await run('DELETE FROM resources WHERE id = ?', [resource.id]);
  res.json({ message: 'File removed' });
}));

module.exports = router;
