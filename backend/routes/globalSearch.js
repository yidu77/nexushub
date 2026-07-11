const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Global Search Route
router.get('/', verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ members: [], requests: [], resources: [] });

    const searchTerm = `%${q}%`;

    // Search Members
    const members = await pool.query(
      'SELECT * FROM members WHERE name ILIKE $1 OR email ILIKE $1 OR department ILIKE $1',
      [searchTerm]
    );

    // Search Requests
    const requests = await pool.query(
      'SELECT * FROM requests WHERE request_number ILIKE $1 OR title ILIKE $1 OR requested_by ILIKE $1',
      [searchTerm]
    );

    // Search Resources
    const resources = await pool.query(
      'SELECT * FROM resources WHERE resource_code ILIKE $1 OR name ILIKE $1 OR category ILIKE $1',
      [searchTerm]
    );

    res.json({
      members: members.rows,
      requests: requests.rows,
      resources: resources.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;