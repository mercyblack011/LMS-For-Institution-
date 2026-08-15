const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'exam-submissions');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only PDF, JPEG, PNG, WEBP or GIF files are allowed for exam papers'));
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });
