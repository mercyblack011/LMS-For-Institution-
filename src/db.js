require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vta_lms',
};

let pool;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student','instructor','admin') NOT NULL,
    phone VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'fa-book-open',
    duration INT DEFAULT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    study_mode VARCHAR(20) NOT NULL DEFAULT 'Full Time',
    qualification_type VARCHAR(20) NOT NULL DEFAULT 'NVQ-05',
    sem1_modules TEXT,
    sem2_modules TEXT,
    modules TEXT,
    instructor VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    cert_code VARCHAR(64) NOT NULL UNIQUE,
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_certificate (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL,
    nic VARCHAR(50),
    mis_no VARCHAR(50),
    photo_url VARCHAR(500),
    batch VARCHAR(50) NOT NULL DEFAULT 'NVQ-5',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS lecturers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL,
    lecturer_id VARCHAR(50),
    course_id INT NULL,
    modules TEXT,
    photo_url VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('P','A','L') NOT NULL,
    marked_by INT,
    UNIQUE KEY uq_attendance (student_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS diary_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    instructor_id INT NOT NULL,
    course_id INT NULL,
    date DATE NOT NULL,
    week VARCHAR(50),
    month VARCHAR(50),
    batch VARCHAR(50),
    slots TEXT NOT NULL,
    instructor_remarks TEXT,
    to_remarks TEXT,
    to_signature VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_id INT NULL,
    module VARCHAR(255),
    instructor_id INT NOT NULL,
    deadline DATE,
    start_at DATETIME,
    end_at DATETIME,
    instructions TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS timetables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL UNIQUE,
    schedule TEXT NOT NULL,
    updated_by INT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('notes','past_paper') NOT NULL,
    course_id INT NULL,
    module VARCHAR(255),
    unit_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_id INT NULL,
    module VARCHAR(255),
    instructor_id INT NOT NULL,
    start_at DATETIME,
    end_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS exam_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_user_id INT NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(20),
    feedback TEXT,
    UNIQUE KEY uq_exam_submission (exam_id, student_user_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS lectures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    instructor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_user_id INT NOT NULL,
    note TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(20),
    feedback TEXT,
    UNIQUE KEY uq_submission (assignment_id, student_user_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    measurement INT DEFAULT 0,
    estimation INT DEFAULT 0,
    contracts INT DEFAULT 0,
    cad INT DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS forum_threads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    author_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS forum_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    thread_id INT NOT NULL,
    author_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    type ENUM('Internship','Vacancy') NOT NULL,
    location VARCHAR(255),
    closes_at DATE,
    description TEXT,
    posted_by INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    incharge VARCHAR(255),
    event_at DATETIME,
    pdf_path VARCHAR(500),
    pdf_name VARCHAR(255),
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS event_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    photo_path VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
];

async function initDb() {
  // XAMPP's MySQL doesn't pre-create application databases, so create it if missing.
  const bootstrap = await mysql.createConnection({
    host: config.host, port: config.port, user: config.user, password: config.password,
  });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();

  pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 10, dateStrings: true, decimalNumbers: true });

  for (const statement of SCHEMA_STATEMENTS) {
    await pool.query(statement);
  }

  // Lightweight migration for columns added after a database already exists
  // (CREATE TABLE IF NOT EXISTS above only helps on a brand new database).
  await ensureColumn('students', 'mis_no', 'ADD COLUMN mis_no VARCHAR(50)');
  await ensureColumn('students', 'photo_url', 'ADD COLUMN photo_url VARCHAR(500)');
  await ensureColumn('courses', 'study_mode', "ADD COLUMN study_mode VARCHAR(20) NOT NULL DEFAULT 'Full Time'");
  await ensureColumn('courses', 'qualification_type', "ADD COLUMN qualification_type VARCHAR(20) NOT NULL DEFAULT 'NVQ-05'");
  await ensureColumn('courses', 'sem1_modules', 'ADD COLUMN sem1_modules TEXT');
  await ensureColumn('courses', 'sem2_modules', 'ADD COLUMN sem2_modules TEXT');
  await ensureColumn('courses', 'modules', 'ADD COLUMN modules TEXT');
  await ensureColumn('courses', 'instructor', 'ADD COLUMN instructor VARCHAR(255)');
  await ensureColumn('courses', 'duration', 'ADD COLUMN duration INT DEFAULT NULL');
  await ensureColumn('courses', 'logo_url', 'ADD COLUMN logo_url VARCHAR(500) DEFAULT NULL');
  await ensureColumn('diary_entries', 'course_id', 'ADD COLUMN course_id INT NULL');
  await ensureColumn('diary_entries', 'to_signature', 'ADD COLUMN to_signature VARCHAR(255)');
  await ensureColumn('diary_entries', 'batch', 'ADD COLUMN batch VARCHAR(50)');
  await ensureColumn('assignments', 'module', 'ADD COLUMN module VARCHAR(255)');
  await ensureColumn('assignments', 'start_at', 'ADD COLUMN start_at DATETIME');
  await ensureColumn('assignments', 'end_at', 'ADD COLUMN end_at DATETIME');
  await ensureColumn('assignments', 'file_path', 'ADD COLUMN file_path VARCHAR(500)');
  await ensureColumn('assignments', 'file_name', 'ADD COLUMN file_name VARCHAR(255)');
  await ensureColumn('assignments', 'batch', 'ADD COLUMN batch VARCHAR(50)');
  await ensureColumn('exams', 'batch', 'ADD COLUMN batch VARCHAR(50)');
  await ensureColumn('submissions', 'file_path', 'ADD COLUMN file_path VARCHAR(500)');
  await ensureColumn('submissions', 'file_name', 'ADD COLUMN file_name VARCHAR(255)');
}

async function ensureColumn(table, column, alterClause) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [config.database, table, column]
  );
  if (rows[0].c === 0) {
    await pool.query(`ALTER TABLE ${table} ${alterClause}`);
  }
}

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function run(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return { lastInsertRowid: result.insertId, changes: result.affectedRows };
}

module.exports = { initDb, query, run, get pool() { return pool; } };
