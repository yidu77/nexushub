const bcrypt = require('bcryptjs');
const pool = require('./db');

const seedUser = async () => {
  try {
    const email = 'admin@nexushub.com';
    const password = 'password123';
    
    // Hash the password just like we do in the real app
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert into database
    await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      [email, passwordHash, 'admin']
    );
    
    console.log('✅ Test user created successfully!');
    console.log(' Email: admin@nexushub.com');
    console.log('🔑 Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
};

seedUser();