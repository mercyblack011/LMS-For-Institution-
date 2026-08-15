const express = require('express');
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/stats', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const [{ n: totalStudents }] = await query('SELECT COUNT(*) AS n FROM students');
  res.json({ totalStudents });
}));

module.exports = router;
