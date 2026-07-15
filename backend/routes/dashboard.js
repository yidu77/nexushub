const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// GET dashboard statistics
// Per the role spec: Admin, Manager, and Viewer can all see the dashboard.
// Staff cannot (they don't have "view dashboard" in their permission list).
// Admin & Viewer see system-wide numbers. Manager sees only their own department.
router.get('/stats', verifyToken, async (req, res) => {
  try {
    if (req.userRole === 'staff') {
      return res.status(403).json({ error: 'Access denied. Dashboard is not available for staff accounts.' });
    }

    const isManager = req.userRole === 'manager';
    const deptFilter = isManager ? 'WHERE department = $1' : '';
    const deptValue = isManager ? [req.userDepartment] : [];

    // Members count — members table has its own department column already
    const membersResult = await pool.query(
      `SELECT COUNT(*) FROM members ${isManager ? 'WHERE department = $1' : ''}`,
      deptValue
    );
    const totalMembers = parseInt(membersResult.rows[0].count);

    // Requests counts — requests table also has a department column (added in our migration)
    const requestsResult = await pool.query(
      `SELECT COUNT(*) FROM requests ${deptFilter}`,
      deptValue
    );
    const totalRequests = parseInt(requestsResult.rows[0].count);

    const pendingQuery = isManager
      ? "SELECT COUNT(*) FROM requests WHERE status = 'Pending' AND department = $1"
      : "SELECT COUNT(*) FROM requests WHERE status = 'Pending'";
    const pendingResult = await pool.query(pendingQuery, deptValue);
    const pendingRequests = parseInt(pendingResult.rows[0].count);

    const completedQuery = isManager
      ? "SELECT COUNT(*) FROM requests WHERE status = 'Completed' AND department = $1"
      : "SELECT COUNT(*) FROM requests WHERE status = 'Completed'";
    const completedResult = await pool.query(completedQuery, deptValue);
    const completedRequests = parseInt(completedResult.rows[0].count);

    res.json({
      scope: isManager ? `Department: ${req.userDepartment || 'Unassigned'}` : 'System-wide',
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