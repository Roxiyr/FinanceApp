const Budget = require('../models/Budget');

class BudgetController {
  static async getAll(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;
      const budgets = await Budget.findByUserId(userId);
      res.json({ status: 'ok', data: budgets });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;
      const { name, amount, category, period } = req.body;

      if (!name || !amount) {
        return res.status(400).json({ error: 'Nama dan jumlah diperlukan' });
      }

      const id = await Budget.create(userId, { name, amount, category, period });
      res.status(201).json({ status: 'ok', id, message: 'Budget berhasil ditambah' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;
      const { id } = req.params;
      const data = req.body;

      // Verifikasi bahwa budget milik user ini
      const budget = await Budget.findById(id);
      if (!budget) {
        return res.status(404).json({ error: 'Budget tidak ditemukan' });
      }
      if (budget.user_id !== userId) {
        return res.status(403).json({ error: 'Tidak memiliki akses ke budget ini' });
      }

      const affectedRows = await Budget.update(id, userId, data);
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Budget tidak ditemukan' });
      }
      res.json({ status: 'ok', message: 'Budget berhasil diupdate' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;
      const { id } = req.params;

      // Verifikasi bahwa budget milik user ini
      const budget = await Budget.findById(id);
      if (!budget) {
        return res.status(404).json({ error: 'Budget tidak ditemukan' });
      }
      if (budget.user_id !== userId) {
        return res.status(403).json({ error: 'Tidak memiliki akses ke budget ini' });
      }

      const affectedRows = await Budget.delete(id, userId);
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Budget tidak ditemukan' });
      }
      res.json({ status: 'ok', message: 'Budget berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = BudgetController;