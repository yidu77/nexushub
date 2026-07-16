const express = require('express');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin, isAdminOrManager } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

// GET all members (Managers only see their department)
router.get('/', async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = `SELECT m.*, u.role FROM members m LEFT JOIN users u ON m.user_id = u.id WHERE 1=1`;
    const values = [];

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

// PUT (Update Member) - ADMIN or MANAGER
// Admins can edit anyone, anything (except password — see note below).
// Managers can only edit members in their OWN department, and cannot
// change role or department (prevents a manager escalating someone to
// admin, or moving them out of their team).
// Passwords are never settable here by anyone — self-service only (see routes/auth.js).
router.put('/:id', isAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, status, role } = req.body;

    const memberCheck = await pool.query('SELECT user_id, department FROM members WHERE id = $1', [id]);
    if (memberCheck.rows.length === 0) return res.status(404).json({ error: 'Member not found' });

    const existingMember = memberCheck.rows[0];
    const userId = existingMember.user_id;

    // Managers can only touch members in their own department
    if (req.userRole === 'manager' && existingMember.department !== req.userDepartment) {
      return res.status(403).json({ error: 'You can only manage members in your own department.' });
    }

    // Managers can't reassign role or department — only admins can
    const isManager = req.userRole === 'manager';
    const finalDepartment = isManager ? existingMember.department : department;

    const updatedMember = await pool.query(
      'UPDATE members SET name=$1, email=$2, phone=$3, department=$4, status=$5 WHERE id=$6 RETURNING *',
      [name, email, phone, finalDepartment, status, id]
    );

    if (userId && !isManager) {
      // Only an admin's edit can change role/department on the linked user account
      await pool.query('UPDATE users SET role=$1, department=$2 WHERE id=$3', [role, finalDepartment, userId]);
    }

    res.json(updatedMember.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - ADMIN ONLY
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const memberResult = await pool.query('SELECT user_id FROM members WHERE id = $1', [id]);
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const userId = memberResult.rows[0].user_id;

    await pool.query('DELETE FROM members WHERE id = $1', [id]);

    if (userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }

    res.json({ message: 'Member deleted successfully!' });
  } catch (error) {
    console.error('DELETE ERROR:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;