const router = require('express').Router();
const pool = require('../db');

// reporting endpoints — these just query the two views defined in schema.sql
// all the join/aggregation complexity lives in the DB view, not here

// GET active listings with neighborhood scores (View 1)
router.get('/active-listings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM active_listings_with_neighborhood');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET agent days-on-market performance (View 2)
router.get('/agent-performance', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agent_days_on_market ORDER BY avg_days_on_market ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
