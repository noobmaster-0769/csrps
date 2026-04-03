const router = require('express').Router();
const pool   = require('../db');
const { authenticate } = require('../middleware/auth');

// Grade calculation engine
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 40) return 'D';
  return 'Fail';
}

/**
 * GET /api/results/:studentId
 *
 * DaaS endpoint — returns fully processed result:
 * student info, subject-wise marks, total, percentage, grade, pass/fail
 */
router.get('/:studentId', authenticate, async (req, res) => {
  const { studentId } = req.params;

  // Students can only view their own results
  if (req.user.role === 'student' && req.user.student_id !== parseInt(studentId)) {
    return res.status(403).json({ error: 'You can only view your own result.' });
  }

  try {
    // Fetch student profile
    const studentRes = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (!studentRes.rows[0]) return res.status(404).json({ error: 'Student not found.' });

    // Fetch marks with subject details
    const marksRes = await pool.query(
      `SELECT s.name AS subject, s.max_marks, m.marks
       FROM   marks m
       JOIN   subjects s ON m.subject_id = s.id
       WHERE  m.student_id = $1
       ORDER  BY s.name`,
      [studentId]
    );

    const marks     = marksRes.rows;
    const total     = marks.reduce((sum, m) => sum + m.marks,     0);
    const maxTotal  = marks.reduce((sum, m) => sum + m.max_marks, 0);
    const percentage = maxTotal > 0
      ? parseFloat(((total / maxTotal) * 100).toFixed(2))
      : 0;
    const grade  = calculateGrade(percentage);
    const status = grade === 'Fail' ? 'Fail' : 'Pass';

    res.json({
      student:    studentRes.rows[0],
      marks,
      total,
      max_total:  maxTotal,
      percentage,
      grade,
      status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
