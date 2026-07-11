const express = require('express');
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

// GET all resources (with Search AND Filters)
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = 'SELECT * FROM resources WHERE 1=1';
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (resource_code ILIKE $${values.length} OR name ILIKE $${values.length})`;
    }
    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }
    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    const resources = await pool.query(query, values);
    res.json(resources.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST (Create) - ADMIN ONLY
router.post('/', isAdmin, async (req, res) => {
  try {
    const { resource_code, name, category, status } = req.body;
    const existingResource = await pool.query('SELECT * FROM resources WHERE resource_code = $1', [resource_code]);
    if (existingResource.rows.length > 0) return res.status(400).json({ error: 'Resource code already exists' });

    const newResource = await pool.query(
      'INSERT INTO resources (resource_code, name, category, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [resource_code, name, category, status || 'Available']
    );
    res.status(201).json(newResource.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT (Update) - ADMIN ONLY
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { resource_code, name, category, status } = req.body;
    const updatedResource = await pool.query(
      'UPDATE resources SET resource_code=$1, name=$2, category=$3, status=$4 WHERE id=$5 RETURNING *',
      [resource_code, name, category, status, id]
    );
    if (updatedResource.rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json(updatedResource.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - ADMIN ONLY
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedResource = await pool.query('DELETE FROM resources WHERE id=$1 RETURNING *', [id]);
    if (deletedResource.rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;