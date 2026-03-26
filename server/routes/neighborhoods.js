const router = require('express').Router();
const pool = require('../db');

// GET all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM neighborhood ORDER BY city, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM neighborhood WHERE neighborhood_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { name, city, state, zip_code, walkability_score, school_rating, flood_zone, median_income } = req.body;
  if (!name || !city || !state || !zip_code) {
    return res.status(400).json({ error: 'name, city, state, and zip_code are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO neighborhood (name, city, state, zip_code, walkability_score, school_rating, flood_zone, median_income) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, city, state, zip_code, walkability_score || null, school_rating || null, flood_zone || null, median_income || null]
    );
    res.status(201).json({ neighborhood_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { name, city, state, zip_code, walkability_score, school_rating, flood_zone, median_income } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE neighborhood SET name=?, city=?, state=?, zip_code=?, walkability_score=?, school_rating=?, flood_zone=?, median_income=? WHERE neighborhood_id=?',
      [name, city, state, zip_code, walkability_score, school_rating, flood_zone, median_income, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM neighborhood WHERE neighborhood_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
