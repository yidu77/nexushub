const express = require('express');
const cors = require('cors');
require('dotenv').config();
   const pool = require('./db');
   const authRoutes = require('./routes/auth');
   const memberRoutes = require('./routes/members');
   const requestRoutes = require('./routes/requests');
      const dashboardRoutes = require('./routes/dashboard');
      const resourceRoutes = require('./routes/resources');
         const notificationRoutes = require('./routes/notifications');
            const searchRoutes = require('./routes/globalSearch'); 
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
   app.use('/api/requests', requestRoutes);
   console.log('✅ Request routes loaded at /api/requests');
      app.use('/api/dashboard', dashboardRoutes);
   console.log('✅ Dashboard routes loaded at /api/dashboard');
      app.use('/api/resources', resourceRoutes);
   console.log('✅ Resource routes loaded at /api/resources');
      app.use('/api/notifications', notificationRoutes);
   console.log('✅ Notification routes loaded at /api/notifications');
      app.use('/api/search', searchRoutes);
   console.log('✅ Global Search routes loaded at /api/search');

// A simple test route
app.get('/', (req, res) => {
  res.send('NexusHub Backend is running! 🚀');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});