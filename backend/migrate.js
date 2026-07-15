const pool = require('./db');

const migrate = async () => {
  try {
    // 1. Add new columns to users (safe — just adds empty columns, no data lost)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);`);
    console.log('✅ users table updated (department, name, phone, display_name)');

    // 2. Link members to users (safe — just adds an empty column)
    await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);`);
    console.log('✅ members table updated (user_id)');

    // 3. Requests: requested_by / assigned_to were free text (VARCHAR).
    // We can't auto-convert old text values into real user IDs, so we
    // safely drop just those two columns and re-add them as proper
    // foreign keys. Everything else in the table (title, status, etc.) stays untouched.
    await pool.query(`ALTER TABLE requests DROP COLUMN IF EXISTS requested_by;`);
    await pool.query(`ALTER TABLE requests DROP COLUMN IF EXISTS assigned_to;`);
    await pool.query(`ALTER TABLE requests ADD COLUMN requested_by INTEGER REFERENCES users(id);`);
    await pool.query(`ALTER TABLE requests ADD COLUMN assigned_to INTEGER REFERENCES users(id);`);
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS department VARCHAR(100);`);
    console.log('✅ requests table updated (requested_by, assigned_to now link to real users; department added)');

    console.log('\n🎉 Migration complete! Your database now matches the new schema.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrate();