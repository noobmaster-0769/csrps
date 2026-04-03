const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * GET /api/analytics
 *
 * DaaS endpoint — returns:
 *   - Subject-wise average marks
 *   - Overall pass/fail counts
 *   - Top 5 students by percentage
 */
router.get('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    // 1. Average marks per subject
    const subjectAvg = await pool.query(
      `SELECT s.name,
              ROUND(AVG(m.marks)::numeric, 2) AS avg_marks,
              s.max_marks
       FROM   marks m
       JOIN   subjects s ON m.subject_id = s.id
       GROUP  BY s.id, s.name, s.max_marks
       ORDER  BY s.name`
    );

    // 2. Pass / Fail per student (percentage >= 40 = Pass)
const passFail = await pool.query(
  `SELECT
     COUNT(*) FILTER (
       WHERE (total_marks::float / NULLIF(max_marks, 0)) * 100 >= 40
     ) AS pass_count,
     COUNT(*) FILTER (
       WHERE (total_marks::float / NULLIF(max_marks, 0)) * 100 < 40
     ) AS fail_count,
     COUNT(*) AS total_with_marks
   FROM (
     SELECT m.student_id,
            SUM(m.marks)     AS total_marks,
            SUM(s.max_marks) AS max_marks
     FROM   marks m
     JOIN   subjects s ON m.subject_id = s.id
     GROUP  BY m.student_id
   ) sub`
);

    // 3. Top 5 students
    const topStudents = await pool.query(
      `SELECT st.name, st.roll_no, st.class,
              SUM(m.marks)      AS total,
              SUM(s.max_marks)  AS max_total,
              ROUND(
                (SUM(m.marks)::numeric / NULLIF(SUM(s.max_marks), 0)) * 100,
                2
              ) AS percentage
       FROM   marks m
       JOIN   students st ON m.student_id = st.id
       JOIN   subjects  s  ON m.subject_id = s.id
       GROUP  BY st.id, st.name, st.roll_no, st.class
       ORDER  BY percentage DESC
       LIMIT  5`
    );

    const pf = passFail.rows[0];
    res.json({
      subject_averages: subjectAvg.rows,
      pass_fail: {
        pass:  parseInt(pf.pass_count)  || 0,
        fail:  parseInt(pf.fail_count)  || 0,
        total: parseInt(pf.total_with_marks) || 0
      },
      top_students: topStudents.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
