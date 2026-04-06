const router = require('express').Router();
const pool = require('../db');

// join through listing → property and offer → buyer to get human-readable names
// listing_id lives directly on contract so we avoid an extra join through offer for address lookups
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, p.address, CONCAT(a.first_name, ' ', a.last_name) AS agent_name,
              CONCAT(b.first_name, ' ', b.last_name) AS buyer_name
       FROM contract c
       JOIN listing l  ON c.listing_id = l.listing_id
       JOIN property p ON l.property_id = p.property_id
       JOIN agent a    ON l.agent_id    = a.agent_id
       JOIN offer o    ON c.offer_id    = o.offer_id
       JOIN buyer b    ON o.buyer_id    = b.buyer_id
       ORDER BY c.contract_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contract WHERE contract_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create a contract — offer_id has a UNIQUE constraint so mysql will throw ER_DUP_ENTRY
// if someone tries to create a second contract for the same offer; catch that as a 409
router.post('/', async (req, res) => {
  const { offer_id, listing_id, closing_date, final_price, earnest_money, contract_date } = req.body;
  if (!offer_id || !listing_id || !final_price || !contract_date) {
    return res.status(400).json({ error: 'offer_id, listing_id, final_price, and contract_date are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO contract (offer_id, listing_id, closing_date, final_price, earnest_money, contract_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [offer_id, listing_id, closing_date || null, final_price, earnest_money || null, contract_date, 'active']
    );
    res.status(201).json({ contract_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A contract already exists for this offer' });
    res.status(500).json({ error: err.message });
  }
});

// update contract details — mainly used to set closing_date and flip status to closed
router.put('/:id', async (req, res) => {
  const { closing_date, final_price, earnest_money, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE contract SET closing_date=?, final_price=?, earnest_money=?, status=? WHERE contract_id=?',
      [closing_date || null, final_price, earnest_money || null, status || 'active', req.params.id]
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
    const [result] = await pool.query('DELETE FROM contract WHERE contract_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
