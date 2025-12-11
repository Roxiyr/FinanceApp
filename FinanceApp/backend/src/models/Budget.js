const pool = require('../config/db');

class Budget {
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async create(userId, data) {
    const [result] = await pool.query(
      'INSERT INTO budgets (user_id, name, amount, category, period) VALUES (?, ?, ?, ?, ?)',
      [userId, data.name, data.amount, data.category || 'Umum', data.period || 'monthly']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM budgets WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, userId, data) {
    // Hanya izinkan field yang valid untuk diupdate
    const allowedFields = ['name', 'amount', 'category', 'period'];
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
      `UPDATE budgets SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );
    return result.affectedRows;
  }

  static async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  }
}

module.exports = Budget;