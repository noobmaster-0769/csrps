-- ============================================
-- CSRPS — Cloud Student Result Processing System
-- Database Schema (PostgreSQL / Supabase)
-- ============================================

-- Users table: Admin, Teacher, Student accounts
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  student_id  INTEGER,                   -- populated only when role = 'student'
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Students table: academic records
CREATE TABLE IF NOT EXISTS students (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  class      VARCHAR(50)  NOT NULL,
  roll_no    VARCHAR(20)  UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  max_marks  INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marks table: links student ↔ subject ↔ score
CREATE TABLE IF NOT EXISTS marks (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  marks       INTEGER NOT NULL CHECK (marks >= 0),
  entered_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, subject_id)        -- one mark per student per subject
);

-- Foreign key: users.student_id → students.id
ALTER TABLE users
  ADD CONSTRAINT fk_user_student
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;
