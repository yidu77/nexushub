const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userDepartment = decoded.department; // NEW: We will add this to the token later
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Middleware to check if user is Admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Middleware to check if user is Admin OR Manager
const isAdminOrManager = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'manager') {
    return res.status(403).json({ error: 'Access denied. Admins and Managers only.' });
  }
  next();
};

// Middleware to check if user is NOT a Viewer (can create/edit)
const isNotViewer = (req, res, next) => {
  if (req.userRole === 'viewer') {
    return res.status(403).json({ error: 'Access denied. Viewers have read-only access.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isAdminOrManager, isNotViewer };