const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/students  — DaaS endpoint: all students
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY roll_no');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Student not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students  — admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, class: cls, roll_no } = req.body;
  if (!name || !cls || !roll_no)
    return res.status(400).json({ error: 'name, class and roll_no are required.' });

  try {
    const result = await pool.query(
      'INSERT INTO students (name, class, roll_no) VALUES ($1, $2, $3) RETURNING *',
      [name, cls, roll_no]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Roll number already exists.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/:id  — admin only
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name, class: cls, roll_no } = req.body;
  try {
    const result = await pool.query(
      'UPDATE students SET name=$1, class=$2, roll_no=$3 WHERE id=$4 RETURNING *',
      [name, cls, roll_no, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Student not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id  — admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
