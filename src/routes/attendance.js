const express = require('express');
const db = require('../db');
const { query, run } = db;
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// month format: YYYY-MM - a student's own attendance for the given month
router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const { month } = req.query;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'month query param required, format YYYY-MM' });
  const [student] = await query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
  if (!student) return res.json({ attendance: [] });
  const [year, mon] = month.split('-').map(Number);
  const rows = await query('SELECT date, status FROM attendance WHERE student_id = ? AND YEAR(date) = ? AND MONTH(date) = ?', [student.id, year, mon]);
  res.json({ attendance: rows });
}));

// month format: YYYY-MM - a student calling this only ever sees attendance for classmates in their own course.
router.get('/', requireAuth, requireRole('instructor', 'admin', 'student'), asyncHandler(async (req, res) => {
  const { month } = req.query;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'month query param required, format YYYY-MM' });
  const [year, mon] = month.split('-').map(Number);

  if (req.user.role === 'student') {
    const [enrollment] = await query('SELECT course_id FROM enrollments WHERE user_id = ? ORDER BY enrolled_at DESC LIMIT 1', [req.user.id]);
    if (!enrollment) return res.json({ attendance: [] });
    const rows = await query(`
      SELECT a.student_id, a.date, a.status FROM attendance a
      JOIN students s ON s.id = a.student_id
      JOIN enrollments e ON e.user_id = s.user_id
      WHERE e.course_id = ? AND YEAR(a.date) = ? AND MONTH(a.date) = ?
    `, [enrollment.course_id, year, mon]);
    return res.json({ attendance: rows });
  }

  const rows = await query('SELECT student_id, date, status FROM attendance WHERE YEAR(date) = ? AND MONTH(date) = ?', [year, mon]);
  res.json({ attendance: rows });
}));

router.put('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { student_id, date, status } = req.body || {};
  if (!student_id || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'student_id and date (YYYY-MM-DD) are required' });
  }
  if (date > todayDateStr()) {
    return res.status(400).json({ error: 'Cannot mark attendance for a future date' });
  }
  if (status === null || status === '') {
    await run('DELETE FROM attendance WHERE student_id = ? AND date = ?', [student_id, date]);
    return res.json({ student_id, date, status: null });
  }
  if (!['P', 'A', 'L'].includes(status)) return res.status(400).json({ error: 'status must be P, A, L or null' });

  await run(`
    INSERT INTO attendance (student_id, date, status, marked_by) VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)
  `, [student_id, date, status, req.user.id]);
  res.json({ student_id, date, status });
}));

router.post('/mark-all-present', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { month } = req.body || {};
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'month is required, format YYYY-MM' });
  if (month >= todayDateStr().slice(0, 7)) {
    return res.status(400).json({ error: 'Cannot mark the whole current or a future month present - only past months' });
  }

  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const students = await query('SELECT id FROM students');

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const s of students) {
      for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, mon - 1, d).getDay();
        if (dow === 0 || dow === 6) continue; // skip weekends
        const date = `${month}-${String(d).padStart(2, '0')}`;
        if (date > todayDateStr()) continue; // never mark future dates
        await conn.query(
          "INSERT IGNORE INTO attendance (student_id, date, status, marked_by) VALUES (?, ?, 'P', ?)",
          [s.id, date, req.user.id]
        );
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  res.json({ message: 'Marked all weekdays present where not already marked' });
}));

router.post('/mark-day', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { date, status } = req.body || {};
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date (YYYY-MM-DD) is required' });
  }
  if (!['P', 'A', 'L'].includes(status)) return res.status(400).json({ error: 'status must be P, A or L' });
  if (date > todayDateStr()) return res.status(400).json({ error: 'Cannot mark attendance for a future date' });

  const students = await query('SELECT id FROM students');
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const s of students) {
      await conn.query(`
        INSERT INTO attendance (student_id, date, status, marked_by) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)
      `, [s.id, date, status, req.user.id]);
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  res.json({ message: `Marked all students as ${status} for ${date}` });
}));

module.exports = router;
