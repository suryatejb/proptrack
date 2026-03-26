const router = require('express').Router();
const pool = require('../db');

// GET offers for a listing
router.get('/listing/:listing_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, CONCAT(b.first_name, ' ', b.last_name) AS buyer_name, b.email AS buyer_email
       FROM offer o
       JOIN buyer b ON o.buyer_id = b.buyer_id
       WHERE o.listing_id = ?
       ORDER BY o.submitted_at DESC`,
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
    const [rows] = await pool.query('SELECT * FROM offer WHERE offer_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new offer (plain, no status change)
router.post('/', async (req, res) => {
  const { listing_id, buyer_id, offer_price, contingencies, expiration_date } = req.body;
  if (!listing_id || !buyer_id || !offer_price) {
    return res.status(400).json({ error: 'listing_id, buyer_id, and offer_price are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO offer (listing_id, buyer_id, offer_price, contingencies, expiration_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [listing_id, buyer_id, offer_price, contingencies || null, expiration_date || null, 'pending']
    );
    res.status(201).json({ offer_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST accept an offer — transaction: insert accepted offer + update listing status
router.post('/accept', async (req, res) => {
  const { listing_id, buyer_id, offer_price, contingencies, expiration_date } = req.body;
  if (!listing_id || !buyer_id || !offer_price) {
    return res.status(400).json({ error: 'listing_id, buyer_id, and offer_price are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [offerResult] = await conn.query(
      'INSERT INTO offer (listing_id, buyer_id, offer_price, contingencies, expiration_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [listing_id, buyer_id, offer_price, contingencies || null, expiration_date || null, 'accepted']
    );

    const [updateResult] = await conn.query(
      "UPDATE listing SET status = 'under_contract' WHERE listing_id = ? AND status = 'active'",
      [listing_id]
    );

    // if the listing wasn't active, roll back — we can't accept an offer on it
    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'Listing is not active — offer cannot be accepted' });
    }

    await conn.commit();
    res.status(201).json({ offer_id: offerResult.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT update offer status
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }
  try {
    const [result] = await pool.query('UPDATE offer SET status=? WHERE offer_id=?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM offer WHERE offer_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
