const router = require('express').Router();
const pool = require('../db');

// GET all, optional filters: neighborhood_id, property_type, bedrooms
router.get('/', async (req, res) => {
  try {
    let sql = `
      SELECT p.*, n.name AS neighborhood_name
      FROM property p
      LEFT JOIN neighborhood n ON p.neighborhood_id = n.neighborhood_id
      WHERE 1=1
    `;
    const params = [];
    if (req.query.neighborhood_id) {
      sql += ' AND p.neighborhood_id = ?';
      params.push(req.query.neighborhood_id);
    }
    if (req.query.property_type) {
      sql += ' AND p.property_type = ?';
      params.push(req.query.property_type);
    }
    if (req.query.bedrooms) {
      sql += ' AND p.bedrooms >= ?';
      params.push(req.query.bedrooms);
    }
    sql += ' ORDER BY p.address';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id (with amenities)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, n.name AS neighborhood_name
       FROM property p
       LEFT JOIN neighborhood n ON p.neighborhood_id = n.neighborhood_id
       WHERE p.property_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const [amenities] = await pool.query(
      `SELECT a.amenity_id, a.name, a.category
       FROM amenity a
       JOIN property_amenity pa ON a.amenity_id = pa.amenity_id
       WHERE pa.property_id = ?`,
      [req.params.id]
    );
    res.json({ ...rows[0], amenities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { address, city, state, zip_code, square_feet, bedrooms, bathrooms, year_built, property_type, neighborhood_id } = req.body;
  if (!address || !city || !state || !zip_code || !property_type) {
    return res.status(400).json({ error: 'address, city, state, zip_code, and property_type are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO property (address, city, state, zip_code, square_feet, bedrooms, bathrooms, year_built, property_type, neighborhood_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [address, city, state, zip_code, square_feet || null, bedrooms || null, bathrooms || null, year_built || null, property_type, neighborhood_id || null]
    );
    res.status(201).json({ property_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { address, city, state, zip_code, square_feet, bedrooms, bathrooms, year_built, property_type, neighborhood_id } = req.body;
  if (!address || !city || !state || !zip_code || !property_type) {
    return res.status(400).json({ error: 'address, city, state, zip_code, and property_type are required' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE property SET address=?, city=?, state=?, zip_code=?, square_feet=?, bedrooms=?, bathrooms=?, year_built=?, property_type=?, neighborhood_id=? WHERE property_id=?',
      [address, city, state, zip_code, square_feet || null, bedrooms || null, bathrooms || null, year_built || null, property_type, neighborhood_id || null, req.params.id]
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
    const [result] = await pool.query('DELETE FROM property WHERE property_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
