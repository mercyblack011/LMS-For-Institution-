const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'events');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
function fileFilter(req, file, cb) {
  if (file.fieldname === 'pdf') {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('The event document must be a PDF file'));
  }
  if (file.fieldname === 'photos') {
    if (IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Event photos must be JPEG, PNG, WEBP or GIF images'));
  }
  cb(new Error('Unexpected file field'));
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024, files: 11 } })
  .fields([{ name: 'photos', maxCount: 10 }, { name: 'pdf', maxCount: 1 }]);
