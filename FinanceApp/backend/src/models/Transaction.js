const pool = require('../config/db');

class Transaction {
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    return rows;
  }

  static async create(userId, data) {
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, type, name, category, amount, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, data.type, data.name, data.category, data.amount, data.date, data.notes || null]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, userId, data) {
    // Hanya izinkan field yang valid untuk diupdate
    const allowedFields = ['type', 'name', 'category', 'amount', 'date', 'notes'];
    const updateFields = [];
    const updateValues = [];
    
    for (const field of allowedFields) {
      if (data.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        updateValues.push(data[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return 0;
    }
    
    updateValues.push(id, userId);
    const [result] = await pool.query(
      `UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );
    return result.affectedRows;
  }

  static async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  }

  static async getTotalByType(userId, type) {
    const [rows] = await pool.query(
      'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = ?',
      [userId, type]
    );
    return rows[0].total || 0;
  }
}

module.exports = Transaction;