// Helper script to create a user with bcrypt-hashed password
// Usage: node scripts/createUser.js email name password

const pool = require('../src/config/db'); // exports pool.promise()
const bcrypt = require('bcryptjs');

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node scripts/createUser.js <email> <name> <password>');
    process.exit(1);
  }
  const [email, name, password] = args;

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (email, name, password) VALUES (?, ?, ?)', [email, name, hash]);
    console.log('User created with id:', result.insertId);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create user:', err.message || err);
    process.exit(2);
  }
}

run();
