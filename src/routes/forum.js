const express = require('express');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

function canEditThread(user, thread) {
  if (user.role === 'admin') return true;
  if (user.role !== 'instructor') return false;
  return thread.author_id === user.id;
}

router.get('/threads', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT t.*, u.name AS author_name,
      (SELECT COUNT(*) FROM forum_replies r WHERE r.thread_id = t.id) AS reply_count
    FROM forum_threads t JOIN users u ON u.id = t.author_id
    ORDER BY t.created_at DESC
  `);
  rows.forEach(t => { t.can_edit = canEditThread(req.user, t); });
  res.json({ threads: rows });
}));

router.post('/threads', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { title, body } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const info = await run('INSERT INTO forum_threads (title, body, author_id) VALUES (?, ?, ?)',
    [title.trim(), body || '', req.user.id]);
  const [thread] = await query('SELECT * FROM forum_threads WHERE id = ?', [info.lastInsertRowid]);
  res.status(201).json({ thread });
}));

router.put('/threads/:id', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [thread] = await query('SELECT * FROM forum_threads WHERE id = ?', [req.params.id]);
  if (!thread) return res.status(404).json({ error: 'Announcement not found' });
  if (!canEditThread(req.user, thread)) {
    return res.status(403).json({ error: 'You can only edit announcements you created' });
  }

  const { title, body } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  await run('UPDATE forum_threads SET title = ?, body = ? WHERE id = ?', [title.trim(), body || '', thread.id]);
  const [updated] = await query('SELECT * FROM forum_threads WHERE id = ?', [thread.id]);
  res.json({ thread: updated });
}));

router.get('/threads/:id/replies', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT r.*, u.name AS author_name FROM forum_replies r
    JOIN users u ON u.id = r.author_id
    WHERE r.thread_id = ? ORDER BY r.created_at ASC
  `, [req.params.id]);
  res.json({ replies: rows });
}));

router.post('/threads/:id/replies', requireAuth, asyncHandler(async (req, res) => {
  const [thread] = await query('SELECT * FROM forum_threads WHERE id = ?', [req.params.id]);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: 'body is required' });
  const info = await run('INSERT INTO forum_replies (thread_id, author_id, body) VALUES (?, ?, ?)',
    [thread.id, req.user.id, body.trim()]);
  const [reply] = await query('SELECT * FROM forum_replies WHERE id = ?', [info.lastInsertRowid]);
  res.status(201).json({ reply });
}));

module.exports = router;
