const express = require('express');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const SLOT_COUNT = 4; // 8.30-10.30, 10.45-12.15, 12.45-2.45, 2.45-4.15

function emptySchedule() {
  const schedule = {};
  DAYS.forEach(d => { schedule[d] = new Array(SLOT_COUNT).fill(''); });
  return schedule;
}

function cleanSchedule(input) {
  const schedule = emptySchedule();
  if (input && typeof input === 'object') {
    DAYS.forEach(d => {
      if (Array.isArray(input[d])) {
        for (let i = 0; i < SLOT_COUNT; i++) schedule[d][i] = (input[d][i] || '').toString().trim();
      }
    });
  }
  return schedule;
}

// Viewing is open to everyone logged in; only admin can edit.
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { course_id } = req.query;
  if (!course_id) return res.status(400).json({ error: 'course_id is required' });
  const [row] = await query('SELECT * FROM timetables WHERE course_id = ?', [course_id]);
  const schedule = row ? JSON.parse(row.schedule) : emptySchedule();
  res.json({ schedule, updated_at: row ? row.updated_at : null });
}));

router.put('/', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const { course_id, schedule } = req.body || {};
  if (!course_id) return res.status(400).json({ error: 'course_id is required' });

  const [course] = await query('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const cleaned = cleanSchedule(schedule);
  await run(`
    INSERT INTO timetables (course_id, schedule, updated_by) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE schedule = VALUES(schedule), updated_by = VALUES(updated_by), updated_at = NOW()
  `, [course_id, JSON.stringify(cleaned), req.user.id]);

  res.json({ schedule: cleaned });
}));

module.exports = router;
