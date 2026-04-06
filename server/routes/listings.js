const router = require('express').Router();
const pool = require('../db');

// GET all listings — supports optional filters passed as query params
// building the WHERE clause dynamically; WHERE 1=1 is a handy trick so every
// additional filter can just append AND without checking if it's the first one
router.get('/', async (req, res) => {
  try {
    let sql = `
      SELECT l.*, p.address, p.city, p.zip_code, p.bedrooms, p.bathrooms,
             p.square_feet, p.property_type, p.neighborhood_id,
             n.name AS neighborhood_name, n.walkability_score, n.school_rating,
             CONCAT(a.first_name, ' ', a.last_name) AS agent_name, a.email AS agent_email
      FROM listing l
      JOIN property p     ON l.property_id     = p.property_id
      LEFT JOIN neighborhood n ON p.neighborhood_id = n.neighborhood_id  -- LEFT because neighborhood_id is nullable
      JOIN agent a        ON l.agent_id        = a.agent_id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.status) {
      sql += ' AND l.status = ?';
      params.push(req.query.status);
    }
    if (req.query.agent_id) {
      sql += ' AND l.agent_id = ?';
      params.push(req.query.agent_id);
    }
    if (req.query.min_price) {
      sql += ' AND l.list_price >= ?';
      params.push(req.query.min_price);
    }
    if (req.query.max_price) {
      sql += ' AND l.list_price <= ?';
      params.push(req.query.max_price);
    }
    if (req.query.neighborhood_id) {
      sql += ' AND p.neighborhood_id = ?';
      params.push(req.query.neighborhood_id);
    }
    if (req.query.bedrooms) {
      sql += ' AND p.bedrooms >= ?';
      params.push(req.query.bedrooms);
    }

    sql += ' ORDER BY l.list_date DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get a single listing with all the joined info the detail page needs
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, p.address, p.city, p.zip_code, p.bedrooms, p.bathrooms,
              p.square_feet, p.property_type,
              n.name AS neighborhood_name, n.walkability_score, n.school_rating,
              CONCAT(a.first_name, ' ', a.last_name) AS agent_name, a.email AS agent_email, a.phone AS agent_phone
       FROM listing l
       JOIN property p     ON l.property_id     = p.property_id
       LEFT JOIN neighborhood n ON p.neighborhood_id = n.neighborhood_id
       JOIN agent a        ON l.agent_id        = a.agent_id
       WHERE l.listing_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { property_id, agent_id, list_price, status, list_date, expiration_date, description } = req.body;
  if (!property_id || !agent_id || !list_price || !list_date) {
    return res.status(400).json({ error: 'property_id, agent_id, list_price, and list_date are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO listing (property_id, agent_id, list_price, status, list_date, expiration_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [property_id, agent_id, list_price, status || 'active', list_date, expiration_date || null, description || null]
    );
    res.status(201).json({ listing_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { property_id, agent_id, list_price, status, list_date, expiration_date, description } = req.body;
  if (!property_id || !agent_id || !list_price || !list_date) {
    return res.status(400).json({ error: 'property_id, agent_id, list_price, and list_date are required' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE listing SET property_id=?, agent_id=?, list_price=?, status=?, list_date=?, expiration_date=?, description=? WHERE listing_id=?',
      [property_id, agent_id, list_price, status || 'active', list_date, expiration_date || null, description || null, req.params.id]
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
    const [result] = await pool.query('DELETE FROM listing WHERE listing_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
