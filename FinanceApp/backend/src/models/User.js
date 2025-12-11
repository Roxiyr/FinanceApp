const pool = require('../config/db');

class User {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(email, name, passwordHash) {
    const [result] = await pool.query(
      'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
      [email, name, passwordHash]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const [result] = await pool.query(
      'UPDATE users SET ? WHERE id = ?',
      [data, id]
    );
    return result.affectedRows;
  }
}

module.exports = User;