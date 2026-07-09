const express = require('express');
const cors = require('cors');
require('dotenv').config();
   const pool = require('./db');
   const authRoutes = require('./routes/auth');
   const memberRoutes = require('./routes/members');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to allow frontend to talk to backend
app.use(cors());
// Middleware to read JSON data from the frontend
app.use(express.json());
      app.use('/api/auth', authRoutes);
   console.log('✅ Auth routes loaded at /api/auth');

   app.use('/api/members', memberRoutes);
   console.log('✅ Member routes loaded at /api/members');

// A simple test route
app.get('/', (req, res) => {
  res.send('NexusHub Backend is running! 🚀');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});