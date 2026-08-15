const express = require('express');
const { query, run } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

function computeGpaGrade({ measurement, estimation, contracts, cad }) {
  const avg = (measurement + estimation + contracts + cad) / 4;
  const gpa = Number(((avg / 100) * 4).toFixed(1));
  const grade = avg >= 75 ? 'A' : avg >= 65 ? 'B+' : avg >= 55 ? 'B' : avg >= 45 ? 'C' : 'D';
  return { gpa, grade };
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT s.id AS student_id, s.name AS student_name,
      COALESCE(r.measurement, 0) AS measurement, COALESCE(r.estimation, 0) AS estimation,
      COALESCE(r.contracts, 0) AS contracts, COALESCE(r.cad, 0) AS cad
    FROM students s LEFT JOIN results r ON r.student_id = s.id
    ORDER BY s.name
  `);
  const result = rows.map(r => ({ ...r, ...computeGpaGrade(r) }));
  res.json({ results: result });
}));

// Aggregated assignment + exam marks for every student enrolled in a course, optionally scoped to one module.
// Students only ever get their own row back - never their classmates' marks.
router.get('/module', requireAuth, asyncHandler(async (req, res) => {
  const { course_id, module, batch } = req.query;
  if (!course_id) return res.status(400).json({ error: 'course_id is required' });

  if (req.user.role === 'instructor') {
    const [lecturer] = await query('SELECT * FROM lecturers WHERE user_id = ? AND course_id = ?', [req.user.id, course_id]);
    let allowedModules = [];
    try { allowedModules = lecturer ? JSON.parse(lecturer.modules || '[]').map(m => m.module) : []; } catch (e) { allowedModules = []; }
    const inScope = lecturer && (!module || allowedModules.includes(module));
    if (!inScope) return res.status(403).json({ error: 'You can only view results for a course and module you are assigned to teach.' });
  }

  // A student's own batch always wins over whatever batch filter was requested - they only ever see
  // their own cohort's results, matching the same rule applied to the assignment/exam list pages.
  let effectiveBatch = batch || null;
  if (req.user.role === 'student') {
    const [myStudent] = await query('SELECT batch FROM students WHERE user_id = ?', [req.user.id]);
    effectiveBatch = myStudent ? myStudent.batch : effectiveBatch;
  }

  const assignClauses = ['course_id = ?'];
  const assignParams = [course_id];
  if (module) { assignClauses.push('module = ?'); assignParams.push(module); }
  if (effectiveBatch) { assignClauses.push('(batch IS NULL OR batch = ?)'); assignParams.push(effectiveBatch); }
  const assignments = await query(`SELECT id, title FROM assignments WHERE ${assignClauses.join(' AND ')} ORDER BY created_at`, assignParams);

  const examClauses = ['course_id = ?'];
  const examParams = [course_id];
  if (module) { examClauses.push('module = ?'); examParams.push(module); }
  if (effectiveBatch) { examClauses.push('(batch IS NULL OR batch = ?)'); examParams.push(effectiveBatch); }
  const exams = await query(`SELECT id, title FROM exams WHERE ${examClauses.join(' AND ')} ORDER BY created_at`, examParams);

  const studentClauses = ['en.course_id = ?'];
  const studentParams = [course_id];
  if (effectiveBatch) { studentClauses.push('s.batch = ?'); studentParams.push(effectiveBatch); }
  const students = await query(`
    SELECT u.id AS user_id, u.name AS student_name
    FROM enrollments en JOIN users u ON u.id = en.user_id
    LEFT JOIN students s ON s.user_id = u.id
    WHERE ${studentClauses.join(' AND ')}
    ORDER BY u.name
  `, studentParams);

  const assignmentIds = assignments.map(a => a.id);
  const examIds = exams.map(e => e.id);

  const subRows = assignmentIds.length
    ? await query('SELECT assignment_id, student_user_id, grade FROM submissions WHERE assignment_id IN (?)', [assignmentIds])
    : [];
  const examSubRows = examIds.length
    ? await query('SELECT exam_id, student_user_id, grade FROM exam_submissions WHERE exam_id IN (?)', [examIds])
    : [];

  const result = students.map(s => {
    const assignmentMarks = {};
    assignments.forEach(a => {
      const sub = subRows.find(r => r.assignment_id === a.id && r.student_user_id === s.user_id);
      assignmentMarks[a.id] = sub ? { grade: sub.grade, submitted: true } : { grade: null, submitted: false };
    });
    const examMarks = {};
    exams.forEach(e => {
      const sub = examSubRows.find(r => r.exam_id === e.id && r.student_user_id === s.user_id);
      examMarks[e.id] = sub ? { grade: sub.grade, submitted: true } : { grade: null, submitted: false };
    });
    return { user_id: s.user_id, student_name: s.student_name, assignments: assignmentMarks, exams: examMarks };
  });

  const visibleResult = req.user.role === 'student' ? result.filter(r => r.user_id === req.user.id) : result;
  res.json({ assignments, exams, students: visibleResult });
}));

router.put('/:studentId', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const [student] = await query('SELECT * FROM students WHERE id = ?', [req.params.studentId]);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const clamp = v => Math.max(0, Math.min(100, Number(v) || 0));
  const measurement = clamp(req.body?.measurement);
  const estimation = clamp(req.body?.estimation);
  const contracts = clamp(req.body?.contracts);
  const cad = clamp(req.body?.cad);

  await run(`
    INSERT INTO results (student_id, measurement, estimation, contracts, cad) VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE measurement = VALUES(measurement), estimation = VALUES(estimation),
      contracts = VALUES(contracts), cad = VALUES(cad), updated_at = NOW()
  `, [student.id, measurement, estimation, contracts, cad]);

  const [row] = await query('SELECT * FROM results WHERE student_id = ?', [student.id]);
  res.json({ result: { ...row, student_name: student.name, ...computeGpaGrade(row) } });
}));

module.exports = router;
