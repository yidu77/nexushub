const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all members (with basic search/filter)
router.get('/', async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = 'SELECT * FROM members WHERE 1=1';
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (name ILIKE $${values.length} OR email ILIKE $${values.length} OR phone ILIKE $${values.length})`;
    }
    if (department) {
      values.push(department);
      query += ` AND department = $${values.length}`;
    }
    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    const members = await pool.query(query, values);
    res.json(members.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST (Add) a new member
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, department, status } = req.body;
    const newMember = await pool.query(
      'INSERT INTO members (name, email, phone, department, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, department, status || 'Active']
    );
    res.status(201).json(newMember.rows[0]);
  } catch (error) {
    console.error(error);
    // Handle unique email constraint
    if (error.code === '23505') {
      return res.status(400).json({ error: 'This email is already in use!' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT (Update) a member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, status } = req.body;
    
    const updatedMember = await pool.query(
      'UPDATE members SET name=$1, email=$2, phone=$3, department=$4, status=$5 WHERE id=$6 RETURNING *',
      [name, email, phone, department, status, id]
    );
    
    if (updatedMember.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(updatedMember.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE a member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMember = await pool.query('DELETE FROM members WHERE id=$1 RETURNING *', [id]);
    
    if (deletedMember.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;