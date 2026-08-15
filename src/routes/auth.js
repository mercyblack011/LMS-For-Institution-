const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { query, run } = require('../db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../middleware/upload');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });
  const allowedRoles = ['student', 'instructor', 'admin'];
  const finalRole = allowedRoles.includes(role) ? role : 'student';
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

  const cleanEmail = email.toLowerCase().trim();
  const existingRows = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
  if (existingRows[0]) return res.status(409).json({ error: 'An account with this email already exists' });

  const hash = bcrypt.hashSync(password, 10);
  const info = await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name.trim(), cleanEmail, hash, finalRole]);

  const [user] = await query('SELECT * FROM users WHERE id = ?', [info.lastInsertRowid]);

  if (finalRole === 'student') {
    await run('INSERT INTO students (user_id, name, batch) VALUES (?, ?, ?)', [user.id, user.name, 'NVQ-5']);
  }

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const [user] = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [user] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
}));

// Combined users + students/lecturers data for the self-service Profile page.
router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
  const [user] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const result = publicUser(user);

  if (user.role === 'student') {
    const [student] = await query(`
      SELECT s.mis_no, s.nic, s.batch, s.photo_url,
        (SELECT c.name FROM enrollments e JOIN courses c ON c.id = e.course_id
         WHERE e.user_id = s.user_id ORDER BY e.enrolled_at DESC, e.id DESC LIMIT 1) AS course_name
      FROM students s WHERE s.user_id = ?
    `, [user.id]);
    result.studentProfile = student || null;
  } else if (user.role === 'instructor') {
    const lecturerRows = await query(`
      SELECT l.lecturer_id, l.modules, l.photo_url, c.name AS course_name
      FROM lecturers l LEFT JOIN courses c ON c.id = l.course_id WHERE l.user_id = ?
    `, [user.id]);
    result.lecturerProfiles = lecturerRows;
  }
  res.json({ user: result });
}));

router.put('/profile', requireAuth, upload.single('photo'), asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  const [user] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: 'User not found' });
  }
  const newName = name ? name.trim() : '';
  if (!newName) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'Name is required' });
  }

  await run('UPDATE users SET name = ? WHERE id = ?', [newName, user.id]);

  const table = user.role === 'student' ? 'students' : user.role === 'instructor' ? 'lecturers' : null;
  if (table) {
    if (req.file) {
      const photoUrl = `/uploads/students/${req.file.filename}`;
      const [oldRow] = await query(`SELECT photo_url FROM ${table} WHERE user_id = ? LIMIT 1`, [user.id]);
      await run(`UPDATE ${table} SET name = ?, photo_url = ? WHERE user_id = ?`, [newName, photoUrl, user.id]);
      if (oldRow && oldRow.photo_url) fs.unlink(`${__dirname}/../../public${oldRow.photo_url}`, () => {});
    } else {
      await run(`UPDATE ${table} SET name = ? WHERE user_id = ?`, [newName, user.id]);
    }
  }

  const [updatedUser] = await query('SELECT * FROM users WHERE id = ?', [user.id]);
  res.json({ user: publicUser(updatedUser) });
}));

router.put('/password', requireAuth, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) return res.status(400).json({ error: 'current_password and new_password are required' });
  if (new_password.length < 4) return res.status(400).json({ error: 'New password must be at least 4 characters' });

  const [user] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hash = bcrypt.hashSync(new_password, 10);
  await run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
  res.json({ message: 'Password updated successfully' });
}));

module.exports = router;
