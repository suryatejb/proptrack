const router = require('express').Router();
const pool = require('../db');

// fetch all offers on a specific listing, joined with buyer name/email
// so the listing detail page doesn't need a second round-trip to look up the buyer
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

// accept an offer — this hits the stored procedure instead of doing the transaction
// inline because the ROLLBACK logic needs to live in one place. if the listing
// isn't active anymore the procedure rolls everything back and signals a 45000 error
router.post('/accept', async (req, res) => {
  const { listing_id, buyer_id, offer_price, contingencies, expiration_date } = req.body;
  if (!listing_id || !buyer_id || !offer_price) {
    return res.status(400).json({ error: 'listing_id, buyer_id, and offer_price are required' });
  }

  try {
    const [resultSets] = await pool.query(
      'CALL accept_offer(?, ?, ?, ?, ?)',
      [listing_id, buyer_id, offer_price, contingencies || null, expiration_date || null]
    );

    const offerId = resultSets?.[0]?.[0]?.offer_id || null;
    res.status(201).json({ offer_id: offerId });
  } catch (err) {
    if (err.code === 'ER_SP_DOES_NOT_EXIST') {
      return res.status(500).json({ error: 'Database procedure accept_offer is missing. Re-import sql/schema.sql to apply the latest transaction definition.' });
    }
    if (err.sqlState === '45000') {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// update just the status field — used when manually rejecting or marking expired
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
