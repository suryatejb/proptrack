const router = require('express').Router();
const pool = require('../db');

// GET inspections for a listing
router.get('/listing/:listing_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM inspection WHERE listing_id = ? ORDER BY inspection_date DESC',
      [req.params.listing_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all, optional filter by result
router.get('/', async (req, res) => {
  try {
    let sql = `
      SELECT i.*, p.address
      FROM inspection i
      JOIN listing l  ON i.listing_id  = l.listing_id
      JOIN property p ON l.property_id = p.property_id
      WHERE 1=1
    `;
    const params = [];
    if (req.query.result) {
      sql += ' AND i.result = ?';
      params.push(req.query.result);
    }
    sql += ' ORDER BY i.inspection_date DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inspection WHERE inspection_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { listing_id, inspector_name, inspection_date, result, issues_found, report_url } = req.body;
  if (!listing_id || !inspector_name || !inspection_date || !result) {
    return res.status(400).json({ error: 'listing_id, inspector_name, inspection_date, and result are required' });
  }
  const allowed = ['pass', 'fail', 'conditional'];
  if (!allowed.includes(result)) {
    return res.status(400).json({ error: `result must be one of: ${allowed.join(', ')}` });
  }
  try {
    const [r] = await pool.query(
      'INSERT INTO inspection (listing_id, inspector_name, inspection_date, result, issues_found, report_url) VALUES (?, ?, ?, ?, ?, ?)',
      [listing_id, inspector_name, inspection_date, result, issues_found || null, report_url || null]
    );
    res.status(201).json({ inspection_id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { inspector_name, inspection_date, result, issues_found, report_url } = req.body;
  try {
    const [r] = await pool.query(
      'UPDATE inspection SET inspector_name=?, inspection_date=?, result=?, issues_found=?, report_url=? WHERE inspection_id=?',
      [inspector_name, inspection_date, result, issues_found || null, report_url || null, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [r] = await pool.query('DELETE FROM inspection WHERE inspection_id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
