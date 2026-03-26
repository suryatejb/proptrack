const router = require('express').Router();
const pool = require('../db');

// GET all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agent ORDER BY last_name, first_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agent WHERE agent_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { license_number, first_name, last_name, email, phone, brokerage, hire_date } = req.body;
  if (!license_number || !first_name || !last_name || !email || !brokerage) {
    return res.status(400).json({ error: 'license_number, first_name, last_name, email, and brokerage are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO agent (license_number, first_name, last_name, email, phone, brokerage, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [license_number, first_name, last_name, email, phone || null, brokerage, hire_date || null]
    );
    res.status(201).json({ agent_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'License number or email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { license_number, first_name, last_name, email, phone, brokerage, hire_date } = req.body;
  if (!license_number || !first_name || !last_name || !email || !brokerage) {
    return res.status(400).json({ error: 'license_number, first_name, last_name, email, and brokerage are required' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE agent SET license_number=?, first_name=?, last_name=?, email=?, phone=?, brokerage=?, hire_date=? WHERE agent_id=?',
      [license_number, first_name, last_name, email, phone || null, brokerage, hire_date || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'License number or email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM agent WHERE agent_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
