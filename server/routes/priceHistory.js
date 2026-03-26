const router = require('express').Router();
const pool = require('../db');

// GET price history for a listing
router.get('/listing/:listing_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM price_history WHERE listing_id = ? ORDER BY change_date DESC',
      [req.params.listing_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM price_history WHERE price_history_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { listing_id, old_price, new_price, change_date, change_reason } = req.body;
  if (!listing_id || !old_price || !new_price || !change_date) {
    return res.status(400).json({ error: 'listing_id, old_price, new_price, and change_date are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO price_history (listing_id, old_price, new_price, change_date, change_reason) VALUES (?, ?, ?, ?, ?)',
      [listing_id, old_price, new_price, change_date, change_reason || null]
    );
    res.status(201).json({ price_history_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM price_history WHERE price_history_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
