const express = require('express');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  let rows = await query(`
    SELECT l.*, c.name AS course_name FROM lectures l
    JOIN courses c ON c.id = l.course_id
    ORDER BY l.scheduled_at IS NULL, l.scheduled_at ASC, l.created_at DESC
  `);

  if (req.user.role === 'instructor') {
    const myLecturerRows = await query('SELECT course_id FROM lecturers WHERE user_id = ?', [req.user.id]);
    const myCourseIds = new Set(myLecturerRows.map(l => l.course_id));
    rows = rows.filter(l => myCourseIds.has(l.course_id));
  }

  res.json({ lectures: rows });
}));

router.post('/', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const { title, course_id, description, scheduled_at } = req.body || {};
  if (!title || !course_id) return res.status(400).json({ error: 'title and course_id are required' });

  const [course] = await query('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const info = await run('INSERT INTO lectures (course_id, instructor_id, title, description, scheduled_at) VALUES (?, ?, ?, ?, ?)',
    [course_id, req.user.id, title.trim(), description || '', scheduled_at || null]);
  const [lecture] = await query('SELECT l.*, c.name AS course_name FROM lectures l JOIN courses c ON c.id = l.course_id WHERE l.id = ?', [info.lastInsertRowid]);
  res.status(201).json({ lecture });
}));

router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const [lecture] = await query('SELECT * FROM lectures WHERE id = ?', [req.params.id]);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

  const { title, course_id, description, scheduled_at } = req.body || {};
  await run('UPDATE lectures SET title = ?, course_id = ?, description = ?, scheduled_at = ? WHERE id = ?', [
    title ?? lecture.title,
    course_id ?? lecture.course_id,
    description ?? lecture.description,
    scheduled_at === undefined ? lecture.scheduled_at : scheduled_at,
    lecture.id,
  ]);
  const [updated] = await query('SELECT l.*, c.name AS course_name FROM lectures l JOIN courses c ON c.id = l.course_id WHERE l.id = ?', [lecture.id]);
  res.json({ lecture: updated });
}));

router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const info = await run('DELETE FROM lectures WHERE id = ?', [req.params.id]);
  if (info.changes === 0) return res.status(404).json({ error: 'Lecture not found' });
  res.json({ message: 'Lecture removed' });
}));

module.exports = router;
