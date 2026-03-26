const router = require('express').Router();
const pool = require('../db');

// GET showings for a listing
router.get('/listing/:listing_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, CONCAT(b.first_name, ' ', b.last_name) AS buyer_name,
              CONCAT(a.first_name, ' ', a.last_name) AS agent_name
       FROM showing_appointment s
       JOIN buyer b ON s.buyer_id = s.buyer_id
       JOIN agent a ON s.agent_id = a.agent_id
       WHERE s.listing_id = ?
       ORDER BY s.scheduled_time DESC`,
      [req.params.listing_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all showings, optional filter by agent or date
router.get('/', async (req, res) => {
  try {
    let sql = `
      SELECT s.*,
             CONCAT(b.first_name, ' ', b.last_name) AS buyer_name,
             CONCAT(a.first_name, ' ', a.last_name) AS agent_name,
             p.address
      FROM showing_appointment s
      JOIN buyer b   ON s.buyer_id   = b.buyer_id
      JOIN agent a   ON s.agent_id   = a.agent_id
      JOIN listing l ON s.listing_id = l.listing_id
      JOIN property p ON l.property_id = p.property_id
      WHERE 1=1
    `;
    const params = [];
    if (req.query.agent_id) {
      sql += ' AND s.agent_id = ?';
      params.push(req.query.agent_id);
    }
    if (req.query.date) {
      sql += ' AND DATE(s.scheduled_time) = ?';
      params.push(req.query.date);
    }
    sql += ' ORDER BY s.scheduled_time DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM showing_appointment WHERE appointment_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  const { listing_id, buyer_id, agent_id, scheduled_time, feedback_notes } = req.body;
  if (!listing_id || !buyer_id || !agent_id || !scheduled_time) {
    return res.status(400).json({ error: 'listing_id, buyer_id, agent_id, and scheduled_time are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO showing_appointment (listing_id, buyer_id, agent_id, scheduled_time, status, feedback_notes) VALUES (?, ?, ?, ?, ?, ?)',
      [listing_id, buyer_id, agent_id, scheduled_time, 'scheduled', feedback_notes || null]
    );
    res.status(201).json({ appointment_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { scheduled_time, status, feedback_notes } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE showing_appointment SET scheduled_time=?, status=?, feedback_notes=? WHERE appointment_id=?',
      [scheduled_time, status, feedback_notes || null, req.params.id]
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
    const [result] = await pool.query('DELETE FROM showing_appointment WHERE appointment_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
