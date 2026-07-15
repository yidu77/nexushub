const express = require('express');
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET dashboard statistics — Admins only
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get total members
    const membersResult = await pool.query('SELECT COUNT(*) FROM members');
    const totalMembers = parseInt(membersResult.rows[0].count);

    // Get total requests
    const requestsResult = await pool.query('SELECT COUNT(*) FROM requests');
    const totalRequests = parseInt(requestsResult.rows[0].count);

    // Get pending requests
    const pendingResult = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'Pending'");
    const pendingRequests = parseInt(pendingResult.rows[0].count);

    // Get completed requests
    const completedResult = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'Completed'");
    const completedRequests = parseInt(completedResult.rows[0].count);

    res.json({
      totalMembers,
      totalRequests,
      pendingRequests,
      completedRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;