/**
 * seed.js — Populate database with demo data
 * Run: node seed.js
 *
 * Demo accounts created:
 *   admin@csrps.com   / password123  (Admin)
 *   teacher@csrps.com / password123  (Teacher)
 *   student@csrps.com / password123  (Student — Alice Johnson)
 */
const pool   = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  console.log('🌱 Seeding database...\n');
  const pw = await bcrypt.hash('password123', 10);

  // ── Wipe existing data ────────────────────────────────────────────────────
  await pool.query('DELETE FROM marks');
  await pool.query('DELETE FROM users');
  await pool.query('DELETE FROM students');
  await pool.query('DELETE FROM subjects');
  await pool.query('ALTER SEQUENCE students_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE subjects_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE marks_id_seq RESTART WITH 1');

  // ── Users ─────────────────────────────────────────────────────────────────
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)',
    ['Admin User', 'admin@csrps.com', pw, 'admin']
  );
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)',
    ['Mr. John Teacher', 'teacher@csrps.com', pw, 'teacher']
  );

  // ── Students ──────────────────────────────────────────────────────────────
  const students = [
    ['Alice Johnson', '10-A', 'CS001'],
    ['Bob Smith',     '10-A', 'CS002'],
    ['Carol Davis',   '10-B', 'CS003'],
    ['David Wilson',  '10-B', 'CS004'],
    ['Eva Martinez',  '10-A', 'CS005'],
  ];
  const studentIds = [];
  for (const [name, cls, roll] of students) {
    const r = await pool.query(
      'INSERT INTO students (name, class, roll_no) VALUES ($1,$2,$3) RETURNING id',
      [name, cls, roll]
    );
    studentIds.push(r.rows[0].id);
  }

  // Student login account linked to Alice (studentIds[0])
  await pool.query(
    'INSERT INTO users (name, email, password, role, student_id) VALUES ($1,$2,$3,$4,$5)',
    ['Alice Johnson', 'student@csrps.com', pw, 'student', studentIds[0]]
  );

  // ── Subjects ──────────────────────────────────────────────────────────────
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
  const subjectIds = [];
  for (const name of subjects) {
    const r = await pool.query(
      'INSERT INTO subjects (name, max_marks) VALUES ($1, 100) RETURNING id',
      [name]
    );
    subjectIds.push(r.rows[0].id);
  }

  // ── Marks ─────────────────────────────────────────────────────────────────
  // [studentIndex]: [Math, Physics, Chemistry, English, CS]
  const marksGrid = [
    [92, 87, 78, 95, 88],  // Alice  → A
    [75, 68, 82, 79, 91],  // Bob    → B
    [45, 38, 52, 61, 44],  // Carol  → C/D
    [88, 92, 85, 76, 94],  // David  → A
    [62, 71, 58, 83, 69],  // Eva    → C
  ];

  const teacherRes = await pool.query("SELECT id FROM users WHERE email='teacher@csrps.com'");
  const teacherId  = teacherRes.rows[0].id;

  for (let si = 0; si < studentIds.length; si++) {
    for (let sj = 0; sj < subjectIds.length; sj++) {
      await pool.query(
        'INSERT INTO marks (student_id, subject_id, marks, entered_by) VALUES ($1,$2,$3,$4)',
        [studentIds[si], subjectIds[sj], marksGrid[si][sj], teacherId]
      );
    }
  }

  console.log('✅ Database seeded successfully!\n');
  console.log('─────────────────────────────────');
  console.log('  DEMO ACCOUNTS (password: password123)');
  console.log('─────────────────────────────────');
  console.log('  🔴 Admin   : admin@csrps.com');
  console.log('  🔵 Teacher : teacher@csrps.com');
  console.log('  🟢 Student : student@csrps.com  (Alice Johnson)');
  console.log('─────────────────────────────────\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
