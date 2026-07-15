const express = require('express');
const pool = require('../db');
const { verifyToken, isAdminOrManager } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

// GET all requests (with filtering)
// We JOIN users twice: once for who requested it, once for who it's assigned to,
// so we can show real names/emails instead of just raw numeric IDs.
router.get('/', async (req, res) => {
  try {
    const { search, status, priority } = req.query;
    let query = `
      SELECT
        r.*,
        requester.name AS requested_by_name,
        requester.email AS requested_by_email,
        assignee.name AS assigned_to_name,
        assignee.email AS assigned_to_email
      FROM requests r
      LEFT JOIN users requester ON r.requested_by = requester.id
      LEFT JOIN users assignee ON r.assigned_to = assignee.id
      WHERE 1=1
    `;
    const values = [];

    // Manager only sees requests from their own department
    if (req.userRole === 'manager') {
      values.push(req.userDepartment);
      query += ` AND r.department = $${values.length}`;
    }

    // Staff/viewer only see requests they created or are assigned to
    if (req.userRole === 'staff' || req.userRole === 'viewer') {
      values.push(req.userId);
      query += ` AND (r.requested_by = $${values.length} OR r.assigned_to = $${values.length})`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (r.request_number ILIKE $${values.length} OR r.title ILIKE $${values.length} OR requester.name ILIKE $${values.length})`;
    }
    if (status) {
      values.push(status);
      query += ` AND r.status = $${values.length}`;
    }
    if (priority) {
      values.push(priority);
      query += ` AND r.priority = $${values.length}`;
    }

    query += ' ORDER BY r.created_at DESC';
    const requests = await pool.query(query, values);
    res.json(requests.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST (Create) - ANY LOGGED IN USER CAN CREATE (Staff, Manager, Admin)
// requested_by is now taken from the logged-in user's token (req.userId),
// not trusted from the request body — so nobody can submit a request "as" someone else.
router.post('/', async (req, res) => {
  try {
    const { request_number, title, description, status, priority, assigned_to } = req.body;

    const existingRequest = await pool.query('SELECT * FROM requests WHERE request_number = $1', [request_number]);
    if (existingRequest.rows.length > 0) return res.status(400).json({ error: 'Request number already exists' });

    const newRequest = await pool.query(
      `INSERT INTO requests
        (request_number, title, description, status, priority, requested_by, assigned_to, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        request_number,
        title,
        description,
        status || 'Pending',
        priority || 'Medium',
        req.userId,           // always the real logged-in user
        assigned_to || null,  // optional — a user id, or nobody yet
        req.userDepartment || null,
      ]
    );

    // Notify all admins — matches the actual notifications table columns
    const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins.rows) {
      await pool.query(
        'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
        [admin.id, `New work request created: ${newRequest.rows[0].title}`]
      );
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
    const { request_number, title, description, status, priority, assigned_to } = req.body;
    const updatedRequest = await pool.query(
      `UPDATE requests
       SET request_number=$1, title=$2, description=$3, status=$4, priority=$5, assigned_to=$6
       WHERE id=$7 RETURNING *`,
      [request_number, title, description, status, priority, assigned_to || null, id]
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