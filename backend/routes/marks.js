const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/marks  — DaaS endpoint: enter or update marks
// Teacher or Admin can enter marks
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  const { student_id, subject_id, marks } = req.body;

  if (student_id == null || subject_id == null || marks == null)
    return res.status(400).json({ error: 'student_id, subject_id and marks are required.' });

  if (marks < 0) return res.status(400).json({ error: 'Marks cannot be negative.' });

  try {
    // Validate marks don't exceed max_marks for the subject
    const subResult = await pool.query('SELECT max_marks FROM subjects WHERE id = $1', [subject_id]);
    if (!subResult.rows[0]) return res.status(404).json({ error: 'Subject not found.' });

    if (marks > subResult.rows[0].max_marks)
      return res.status(400).json({ error: `Marks cannot exceed ${subResult.rows[0].max_marks}.` });

    // Upsert: insert or update if already exists
    const result = await pool.query(
      `INSERT INTO marks (student_id, subject_id, marks, entered_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, subject_id)
       DO UPDATE SET marks = EXCLUDED.marks, entered_by = EXCLUDED.entered_by
       RETURNING *`,
      [student_id, subject_id, marks, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/:studentId  — get all marks for a student
router.get('/:studentId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.marks, m.subject_id,
              s.name AS subject_name, s.max_marks
       FROM   marks m
       JOIN   subjects s ON m.subject_id = s.id
       WHERE  m.student_id = $1
       ORDER  BY s.name`,
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
