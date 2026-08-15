const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/students', require('./routes/students'));
app.use('/api/lectures', require('./routes/lectures'));
app.use('/api/lecturers', require('./routes/lecturers'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/results', require('./routes/results'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/career', require('./routes/career'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/events', require('./routes/events'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
    return res.status(400).json({ error: message });
  }
  if (err && /are allowed/.test(err.message || '')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`VTA QS LMS server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MySQL / initialize the database schema:');
    console.error(err.message);
    console.error('Make sure XAMPP\'s MySQL module is running and your .env credentials are correct.');
    process.exit(1);
  });
