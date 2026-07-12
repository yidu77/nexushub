const express = require('express');
const pool = require('../db');
const { verifyToken, isAdminOrManager } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

// GET all requests (with filtering)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, status, priority } = req.query;
    let query = `SELECT * FROM requests WHERE 1=1`;
    const values = [];

    // If user is a manager, only show requests from their department
    if (req.userRole === 'manager') {
      values.push(req.userDepartment);
      query += ` AND department = $${values.length}`;
    }
    
    // If user is staff (not admin/manager), only show:
    // 1. Requests they created (requested_by matches their email)
    // 2. Requests assigned to them
    if (req.userRole === 'staff' || req.userRole === 'viewer') {
      values.push(req.userEmail);
      query += ` AND (requested_by = $${values.length} OR assigned_to ILIKE $${values.length})`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (request_number ILIKE $${values.length} OR title ILIKE $${values.length} OR requested_by ILIKE $${values.length})`;
    }
    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }
    if (priority) {
      values.push(priority);
      query += ` AND priority = $${values.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    const requests = await pool.query(query, values);
    res.json(requests.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST (Create) - ANY LOGGED IN USER CAN CREATE (Staff, Manager, Admin)
router.post('/', async (req, res) => {
  try {
    const { request_number, title, description, status, priority, requested_by, assigned_to } = req.body;
    const existingRequest = await pool.query('SELECT * FROM requests WHERE request_number = $1', [request_number]);
    if (existingRequest.rows.length > 0) return res.status(400).json({ error: 'Request number already exists' });

    const newRequest = await pool.query(
      'INSERT INTO requests (request_number, title, description, status, priority, requested_by, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [request_number, title, description, status || 'Pending', priority || 'Medium', requested_by, assigned_to]
    );

    const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins.rows) {
      await pool.query('INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)', [admin.id, `New work request created: ${newRequest.rows[0].title}`, 'request']);
    }

    res.status(201).json(newRequest.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT (Update) - ADMIN OR MANAGER ONLY
router.put('/:id', isAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { request_number, title, description, status, priority, requested_by, assigned_to } = req.body;
    const updatedRequest = await pool.query(
      'UPDATE requests SET request_number=$1, title=$2, description=$3, status=$4, priority=$5, requested_by=$6, assigned_to=$7 WHERE id=$8 RETURNING *',
      [request_number, title, description, status, priority, requested_by, assigned_to, id]
    );
    if (updatedRequest.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    res.json(updatedRequest.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - ADMIN OR MANAGER ONLY
router.delete('/:id', isAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRequest = await pool.query('DELETE FROM requests WHERE id=$1 RETURNING *', [id]);
    if (deletedRequest.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'Request deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;