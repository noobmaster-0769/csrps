const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/subjects
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subjects  — admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, max_marks } = req.body;
  if (!name) return res.status(400).json({ error: 'Subject name is required.' });

  try {
    const result = await pool.query(
      'INSERT INTO subjects (name, max_marks) VALUES ($1, $2) RETURNING *',
      [name, max_marks || 100]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/subjects/:id  — admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Subject deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
