const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all requests (with basic search/filter)
router.get('/', async (req, res) => {
  try {
    const { search, status, priority } = req.query;
    let query = 'SELECT * FROM requests WHERE 1=1';
    const values = [];

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

// POST (Create) a new request
router.post('/', async (req, res) => {
  try {
    const { request_number, title, description, status, priority, requested_by, assigned_to } = req.body;
    
    const newRequest = await pool.query(
      'INSERT INTO requests (request_number, title, description, status, priority, requested_by, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [request_number, title, description, status || 'Pending', priority || 'Medium', requested_by, assigned_to]
    );
    res.status(201).json(newRequest.rows[0]);
  } catch (error) {
    console.error(error);
    // Handle unique request number constraint
    if (error.code === '23505') {
      return res.status(400).json({ error: 'This Request Number is already in use!' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT (Update) a request
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { request_number, title, description, status, priority, requested_by, assigned_to } = req.body;
    
    const updatedRequest = await pool.query(
      'UPDATE requests SET request_number=$1, title=$2, description=$3, status=$4, priority=$5, requested_by=$6, assigned_to=$7 WHERE id=$8 RETURNING *',
      [request_number, title, description, status, priority, requested_by, assigned_to, id]
    );
    
    if (updatedRequest.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(updatedRequest.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE a request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRequest = await pool.query('DELETE FROM requests WHERE id=$1 RETURNING *', [id]);
    
    if (deletedRequest.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;