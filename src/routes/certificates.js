const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT cert.*, c.name AS course_name, u.name AS student_name
    FROM certificates cert
    JOIN courses c ON c.id = cert.course_id
    JOIN users u ON u.id = cert.user_id
    WHERE cert.user_id = ?
    ORDER BY cert.issued_at DESC
  `, [req.user.id]);
  res.json({ certificates: rows });
}));

// Public verification endpoint - anyone with a certificate code can confirm it's genuine
router.get('/verify/:code', asyncHandler(async (req, res) => {
  const [cert] = await query(`
    SELECT cert.*, c.name AS course_name, u.name AS student_name
    FROM certificates cert
    JOIN courses c ON c.id = cert.course_id
    JOIN users u ON u.id = cert.user_id
    WHERE cert.cert_code = ?
  `, [req.params.code]);
  if (!cert) return res.status(404).json({ valid: false, error: 'Certificate not found' });
  res.json({ valid: true, certificate: cert });
}));

module.exports = router;
