const express = require('express');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const DIARY_SELECT = `
  SELECT d.*, c.name AS course_name FROM diary_entries d
  LEFT JOIN courses c ON c.id = d.course_id
`;

function cleanSlots(slots) {
  if (!Array.isArray(slots)) return [];
  return slots.map(s => ({
    time: ((s && s.time) || '').trim(),
    module: ((s && s.module) || '').trim(),
    task: ((s && s.task) || '').trim(),
    subject: ((s && s.subject) || '').trim(),
    signature: ((s && s.signature) || '').trim(),
  }));
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { course_id, month } = req.query;
  let { batch } = req.query;
  const clauses = [];
  const params = [];
  if (course_id) { clauses.push('d.course_id = ?'); params.push(course_id); }
  if (month && /^\d{4}-\d{2}$/.test(month)) { clauses.push("DATE_FORMAT(d.date, '%Y-%m') = ?"); params.push(month); }

  // A student only ever sees diary entries untagged (batch = NULL, applies to everyone) or tagged with
  // their own batch - their own batch always wins over whatever batch was requested, same rule used
  // for the assignment/exam/result list pages.
  if (req.user.role === 'student') {
    const [myStudent] = await query('SELECT batch FROM students WHERE user_id = ?', [req.user.id]);
    batch = myStudent ? myStudent.batch : batch;
  }
  if (batch) { clauses.push('(d.batch IS NULL OR d.batch = ?)'); params.push(batch); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const rows = await query(`${DIARY_SELECT} ${where} ORDER BY d.date DESC, d.id DESC`, params);
  const entries = rows.map(r => ({ ...r, slots: JSON.parse(r.slots) }));
  res.json({ entries });
}));

router.post('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { course_id, date, week, month, slots, instructor_remarks, to_remarks, to_signature, batch } = req.body || {};
  if (!date) return res.status(400).json({ error: 'date is required' });
  if (!Array.isArray(slots)) return res.status(400).json({ error: 'slots must be an array' });

  const info = await run(`
    INSERT INTO diary_entries (instructor_id, course_id, date, week, month, batch, slots, instructor_remarks, to_remarks, to_signature)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    req.user.id, course_id || null, date, week || '', month || '', batch || null,
    JSON.stringify(cleanSlots(slots)), instructor_remarks || '', to_remarks || '', to_signature || '',
  ]);

  const [entry] = await query(`${DIARY_SELECT} WHERE d.id = ?`, [info.lastInsertRowid]);
  res.status(201).json({ entry: { ...entry, slots: JSON.parse(entry.slots) } });
}));

router.put('/:id', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [entry] = await query('SELECT * FROM diary_entries WHERE id = ?', [req.params.id]);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  const { course_id, date, week, month, slots, instructor_remarks, to_remarks, to_signature, batch } = req.body || {};
  if (!date) return res.status(400).json({ error: 'date is required' });
  if (!Array.isArray(slots)) return res.status(400).json({ error: 'slots must be an array' });

  await run(`
    UPDATE diary_entries SET course_id = ?, date = ?, week = ?, month = ?, batch = ?, slots = ?, instructor_remarks = ?, to_remarks = ?, to_signature = ?
    WHERE id = ?
  `, [
    course_id || null, date, week || '', month || '', batch || null,
    JSON.stringify(cleanSlots(slots)), instructor_remarks || '', to_remarks || '', to_signature || '',
    entry.id,
  ]);

  const [updated] = await query(`${DIARY_SELECT} WHERE d.id = ?`, [entry.id]);
  res.json({ entry: { ...updated, slots: JSON.parse(updated.slots) } });
}));

router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const info = await run('DELETE FROM diary_entries WHERE id = ?', [req.params.id]);
  if (info.changes === 0) return res.status(404).json({ error: 'Entry not found' });
  res.json({ message: 'Diary entry deleted' });
}));

module.exports = router;
