const router = require('express').Router();
const pool = require('../db');

// GET all amenities
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM amenity ORDER BY category, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new amenity
router.post('/', async (req, res) => {
  const { name, category } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const [result] = await pool.query('INSERT INTO amenity (name, category) VALUES (?, ?)', [name, category || null]);
    res.status(201).json({ amenity_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Amenity already exists' });
    res.status(500).json({ error: err.message });
  }
});

// POST add amenity to property
router.post('/property/:property_id', async (req, res) => {
  const { amenity_id } = req.body;
  if (!amenity_id) return res.status(400).json({ error: 'amenity_id is required' });
  try {
    await pool.query('INSERT INTO property_amenity (property_id, amenity_id) VALUES (?, ?)', [req.params.property_id, amenity_id]);
    res.status(201).json({ added: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Already linked' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove amenity from property
router.delete('/property/:property_id/:amenity_id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM property_amenity WHERE property_id = ? AND amenity_id = ?',
      [req.params.property_id, req.params.amenity_id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
