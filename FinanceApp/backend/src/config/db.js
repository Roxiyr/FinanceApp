const mysql = require('mysql2');

// Gunakan connection pool untuk performa dan stabilitas yang lebih baik
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'financeapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ [DB] Koneksi gagal:', err.message);
  } else {
    console.log('✅ [DB] MySQL connected');
    connection.release();
  }
});

// Export promise-based pool untuk async/await
module.exports = pool.promise();