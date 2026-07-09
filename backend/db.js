   const { Pool } = require('pg');
   require('dotenv').config();

   // Create a connection pool to the database
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });

   // Test the connection
   pool.on('connect', () => {
     console.log('✅ Connected to the PostgreSQL database successfully!');
   });

   pool.on('error', (err) => {
     console.error('❌ Unexpected error on idle client', err);
     process.exit(-1);
   });

   module.exports = pool;