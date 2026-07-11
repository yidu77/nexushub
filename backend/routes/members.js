const express = require('express');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin, isNotViewer } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

// GET all members (Managers only see their department)
router.get('/', async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = `SELECT m.*, u.role FROM members m LEFT JOIN users u ON m.email = u.email WHERE 1=1`;
    const values = [];

    // NEW: Managers can only see members in their own department
    if (req.userRole === 'manager') {
      values.push(req.userDepartment);
      query += ` AND m.department = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (m.name ILIKE $${values.length} OR m.email ILIKE $${values.length} OR m.phone ILIKE $${values.length})`;
    }
    if (department) {
      values.push(department);
      query += ` AND m.department = $${values.length}`;
    }
    if (status) {
      values.push(status);
      query += ` AND m.status = $${values.length}`;
    }
    
    query += ' ORDER BY m.created_at DESC';
    const members = await pool.query(query, values);
    res.json(members.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST (Create Member + User Account) - ADMIN ONLY
router.post('/', isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, email, phone, department, status, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, role, department) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, role || 'staff', department]
    );
    const userId = userResult.rows[0].id;

    const memberResult = await client.query(
      'INSERT INTO members (name, email, phone, department, status, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, phone, department, status || 'Active', userId]
    );

    await client.query('COMMIT');
    res.status(201).json(memberResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    if (error.code === '23505') res.status(400).json({ error: 'Email already exists' });
    else res.status(500).json({ error: 'Server error' });
  } finally { client.release(); }
});

// PUT (Update Member) - ADMIN ONLY
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, status, role } = req.body;

    // 1. Get the user_id associated with this member
    const memberCheck = await pool.query('SELECT user_id FROM members WHERE id = $1', [id]);
    const userId = memberCheck.rows[0]?.user_id;

    // 2. Update member profile
    const updatedMember = await pool.query(
      'UPDATE members SET name=$1, email=$2, phone=$3, department=$4, status=$5 WHERE id=$6 RETURNING *',
      [name, email, phone, department, status, id]
    );

    // 3. Update user role and department using the user_id (Much safer than email!)
    if (userId && role) {
      await pool.query(
        'UPDATE users SET role=$1, department=$2 WHERE id=$3',
        [role, department, userId]
      );
    }

    if (updatedMember.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(updatedMember.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - ADMIN ONLY
router.delete('/:id', isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const member = await client.query('SELECT email FROM members WHERE id=$1', [id]);
    if (member.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Member not found' }); }
    
    await client.query('DELETE FROM users WHERE email=$1', [member.rows[0].email]);
    await client.query('DELETE FROM members WHERE id=$1', [id]);
    await client.query('COMMIT');
    res.json({ message: 'Member and user account deleted successfully!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally { client.release(); }
});

module.exports = router;