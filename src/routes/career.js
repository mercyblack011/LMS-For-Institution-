const express = require('express');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json({ jobs: await query('SELECT * FROM jobs ORDER BY created_at DESC') });
}));

router.post('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { title, type, location, closes_at, description } = req.body || {};
  if (!title || !['Internship', 'Vacancy'].includes(type)) {
    return res.status(400).json({ error: 'title and type (Internship or Vacancy) are required' });
  }
  const info = await run('INSERT INTO jobs (title, type, location, closes_at, description, posted_by) VALUES (?, ?, ?, ?, ?, ?)',
    [title.trim(), type, location || '', closes_at || null, description || '', req.user.id]);
  const [job] = await query('SELECT * FROM jobs WHERE id = ?', [info.lastInsertRowid]);
  res.status(201).json({ job });
}));

router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const info = await run('DELETE FROM jobs WHERE id = ?', [req.params.id]);
  if (info.changes === 0) return res.status(404).json({ error: 'Job not found' });
  res.json({ message: 'Job removed' });
}));

module.exports = router;
