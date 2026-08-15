const express = require('express');
const fs = require('fs');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const uploadEvent = require('../middleware/uploadEvent');

const router = express.Router();

async function attachPhotos(events) {
  if (!events.length) return events;
  const photos = await query(
    `SELECT * FROM event_photos WHERE event_id IN (?) ORDER BY id`,
    [events.map(e => e.id)]
  );
  events.forEach(ev => { ev.photos = photos.filter(p => p.event_id === ev.id); });
  return events;
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const events = await query(`
    SELECT e.*, u.name AS created_by_name FROM events e
    JOIN users u ON u.id = e.created_by
    ORDER BY e.event_at IS NULL, e.event_at DESC, e.created_at DESC
  `);
  await attachPhotos(events);
  res.json({ events });
}));

router.post('/', requireAuth, requireRole('admin'), uploadEvent, asyncHandler(async (req, res) => {
  const { name, location, incharge, event_at } = req.body || {};
  const pdfFile = req.files && req.files.pdf && req.files.pdf[0];
  const photoFiles = (req.files && req.files.photos) || [];

  if (!name) {
    if (pdfFile) fs.unlink(pdfFile.path, () => {});
    photoFiles.forEach(f => fs.unlink(f.path, () => {}));
    return res.status(400).json({ error: 'name is required' });
  }

  const info = await run(
    `INSERT INTO events (name, location, incharge, event_at, pdf_path, pdf_name, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name.trim(),
      (location || '').trim(),
      (incharge || '').trim(),
      event_at || null,
      pdfFile ? `/uploads/events/${pdfFile.filename}` : null,
      pdfFile ? pdfFile.originalname : null,
      req.user.id,
    ]
  );
  const eventId = info.lastInsertRowid;
  for (const f of photoFiles) {
    await run('INSERT INTO event_photos (event_id, photo_path) VALUES (?, ?)', [eventId, `/uploads/events/${f.filename}`]);
  }

  const [event] = await query(`
    SELECT e.*, u.name AS created_by_name FROM events e JOIN users u ON u.id = e.created_by WHERE e.id = ?
  `, [eventId]);
  await attachPhotos([event]);
  res.status(201).json({ event });
}));

router.put('/:id', requireAuth, requireRole('admin'), uploadEvent, asyncHandler(async (req, res) => {
  const [event] = await query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  const pdfFile = req.files && req.files.pdf && req.files.pdf[0];
  const photoFiles = (req.files && req.files.photos) || [];
  if (!event) {
    if (pdfFile) fs.unlink(pdfFile.path, () => {});
    photoFiles.forEach(f => fs.unlink(f.path, () => {}));
    return res.status(404).json({ error: 'Event not found' });
  }

  const { name, location, incharge, event_at } = req.body || {};
  if (!name) {
    if (pdfFile) fs.unlink(pdfFile.path, () => {});
    photoFiles.forEach(f => fs.unlink(f.path, () => {}));
    return res.status(400).json({ error: 'name is required' });
  }

  const oldPdfPath = event.pdf_path;
  await run(
    `UPDATE events SET name = ?, location = ?, incharge = ?, event_at = ?, pdf_path = ?, pdf_name = ? WHERE id = ?`,
    [
      name.trim(),
      (location || '').trim(),
      (incharge || '').trim(),
      event_at || null,
      pdfFile ? `/uploads/events/${pdfFile.filename}` : event.pdf_path,
      pdfFile ? pdfFile.originalname : event.pdf_name,
      event.id,
    ]
  );
  if (pdfFile && oldPdfPath) {
    fs.unlink(`${__dirname}/../../public${oldPdfPath}`, () => {});
  }
  for (const f of photoFiles) {
    await run('INSERT INTO event_photos (event_id, photo_path) VALUES (?, ?)', [event.id, `/uploads/events/${f.filename}`]);
  }

  const [updated] = await query(`
    SELECT e.*, u.name AS created_by_name FROM events e JOIN users u ON u.id = e.created_by WHERE e.id = ?
  `, [event.id]);
  await attachPhotos([updated]);
  res.json({ event: updated });
}));

router.delete('/:id/photos/:photoId', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const [photo] = await query('SELECT * FROM event_photos WHERE id = ? AND event_id = ?', [req.params.photoId, req.params.id]);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });
  await run('DELETE FROM event_photos WHERE id = ?', [photo.id]);
  fs.unlink(`${__dirname}/../../public${photo.photo_path}`, () => {});
  res.json({ message: 'Photo removed' });
}));

router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const [event] = await query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const photos = await query('SELECT * FROM event_photos WHERE event_id = ?', [event.id]);

  await run('DELETE FROM events WHERE id = ?', [event.id]);

  if (event.pdf_path) fs.unlink(`${__dirname}/../../public${event.pdf_path}`, () => {});
  photos.forEach(p => fs.unlink(`${__dirname}/../../public${p.photo_path}`, () => {}));

  res.json({ message: 'Event removed' });
}));

module.exports = router;
