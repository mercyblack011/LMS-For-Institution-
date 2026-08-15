const bcrypt = require('bcryptjs');
const db = require('./db');
const { initDb, query, run } = db;

const courses = [
  { name: 'Measurement & Quantification', description: 'Taking-off, measurement rules, abstracting and BOQ preparation.', icon: 'fa-ruler-combined', duration: 6 },
  { name: 'Estimation & Cost Planning', description: 'Estimating methods, cost plans, rates, valuation and tender pricing.', icon: 'fa-file-invoice-dollar', duration: 6 },
  { name: 'Contracts & Procurement', description: 'Procurement routes, contract administration, FIDIC, claims and disputes.', icon: 'fa-file-contract', duration: 5 },
  { name: 'CAD & Revit Architecture', description: '2D drafting, BIM workflows, Revit modeling and documentation.', icon: 'fa-cubes', duration: 4 },
  { name: 'Cost Control & Valuation', description: 'Interim valuations, variations, cash flow and final accounts.', icon: 'fa-chart-line', duration: 4 },
  { name: 'Surveying & Leveling', description: 'Practical site surveying, total station, leveling and setting out.', icon: 'fa-compass-drafting', duration: 3 },
];

const studentNames = ["M.T.M. Aflal Mifly","I.M.Ahkam Ali","N.M.Ajab","I.M.Akkeel Ali","M.F.Fasly Ahamed","M.M.Rasath","M.A.R.Uwaisul Karni Ahamed","J.Vaksithan","M.H.Mohamed Ferose","I.M.Ihjas","R.A.Thakee","M.T.Mubasir","M.S.Ahamed Sumaith","M.R.Mohamed Rikkap","N.Safan Ahamed","S.Mohammed Navitkhan","A.Mohamed Ashfaak","N.Asjath Ahamed"];

const jobs = [
  { title: 'Junior Quantity Surveyor', type: 'Internship', location: 'Colombo', closes_at: '2026-08-30', description: 'Entry-level QS internship for NVQ students.' },
  { title: 'Assistant Quantity Surveyor', type: 'Vacancy', location: 'Ampara', closes_at: null, description: 'Diploma/NVQ welcome.' },
];

async function seed() {
  await initDb();

  const [{ n: userCount }] = await query('SELECT COUNT(*) AS n FROM users');
  if (userCount > 0) {
    console.log('Database already has users - skipping seed. Drop the vta_lms database in phpMyAdmin to reseed from scratch.');
    return;
  }

  const hash = bcrypt.hashSync('password123', 10);
  const adminId = (await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Admin User', 'admin@vta.lk', hash, 'admin'])).lastInsertRowid;
  const instructorId = (await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['QS Instructor', 'instructor@vta.lk', hash, 'instructor'])).lastInsertRowid;
  const studentId = (await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Demo Student', 'student@vta.lk', hash, 'student'])).lastInsertRowid;

  const courseIds = [];
  for (const c of courses) {
    const info = await run('INSERT INTO courses (name, description, icon, duration) VALUES (?, ?, ?, ?)', [c.name, c.description, c.icon, c.duration]);
    courseIds.push(info.lastInsertRowid);
  }

  await run('INSERT INTO enrollments (user_id, course_id, progress) VALUES (?, ?, ?)', [studentId, courseIds[0], 40]);
  await run('INSERT INTO students (user_id, name, batch) VALUES (?, ?, ?)', [studentId, 'Demo Student', 'NVQ-5']);

  for (const name of studentNames) {
    await run('INSERT INTO students (name, batch) VALUES (?, ?)', [name, 'NVQ-5']);
  }

  for (const j of jobs) {
    await run('INSERT INTO jobs (title, type, location, closes_at, description, posted_by) VALUES (?, ?, ?, ?, ?, ?)',
      [j.title, j.type, j.location, j.closes_at, j.description, instructorId]);
  }

  console.log('Seed complete. Demo accounts (password: password123):');
  console.log('  admin@vta.lk       (admin)');
  console.log('  instructor@vta.lk  (instructor)');
  console.log('  student@vta.lk     (student)');
}

seed()
  .catch(err => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
