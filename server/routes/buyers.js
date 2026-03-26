const router = require('express').Router();
const pool = require('../db');

// GET all, optional filter by pre_approval_status
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM buyer';
    const params = [];
    if (req.query.status) {
      sql += ' WHERE pre_approval_status = ?';
      params.push(req.query.status);
    }
    sql += ' ORDER BY last_name, first_name';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM buyer WHERE buyer_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { first_name, last_name, email, phone, pre_approval_status, budget_min, budget_max, preferences } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name, and email are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO buyer (first_name, last_name, email, phone, pre_approval_status, budget_min, budget_max, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone || null, pre_approval_status || 'none', budget_min || null, budget_max || null, preferences || null]
    );
    res.status(201).json({ buyer_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { first_name, last_name, email, phone, pre_approval_status, budget_min, budget_max, preferences } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name, and email are required' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE buyer SET first_name=?, last_name=?, email=?, phone=?, pre_approval_status=?, budget_min=?, budget_max=?, preferences=? WHERE buyer_id=?',
      [first_name, last_name, email, phone || null, pre_approval_status || 'none', budget_min || null, budget_max || null, preferences || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM buyer WHERE buyer_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
