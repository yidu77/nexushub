const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    // NEW: Try to find their full name from the members table
    const memberResult = await pool.query('SELECT name FROM members WHERE email = $1', [email]);
    // If they have a member profile, use that name. Otherwise, fallback to their email.
    const fullName = memberResult.rows.length > 0 ? memberResult.rows[0].name : user.email; 

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, department: user.department, name: fullName },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
    user: {
    id: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
    name: user.name,
    phone: user.phone,
    displayName: user.display_name
  }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/// UPDATE PROFILE (Name, Phone, Display Name)
router.put('/profile', verifyToken, async (req, res) => {
  const { name, phone, displayName } = req.body;
  const userId = req.userId;
  
  try {
    // Update users table
    await pool.query(
      'UPDATE users SET name = $1, phone = $2, display_name = $3 WHERE id = $4',
      [name, phone, displayName, userId]
    );
    
    // Also update members table if this user is a member
    await pool.query(
      'UPDATE members SET name = $1, phone = $2 WHERE user_id = $3',
      [name, phone, userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// UPDATE PASSWORD
router.put('/profile/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;
  
  try {
    // Get current user
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;