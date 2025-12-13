const Transaction = require('../models/Transaction');

class TransactionController {
  static async getAll(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;
      const transactions = await Transaction.findByUserId(userId);
      res.json({ status: 'ok', data: transactions });
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
      const { type, name, category, amount, date, notes } = req.body;

      if (!type || !name || !category || !amount) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }

      const id = await Transaction.create(userId, {
        type, name, category, amount, date, notes
      });

      res.status(201).json({ status: 'ok', id, message: 'Transaksi berhasil ditambah' });
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

      // Verifikasi bahwa transaksi milik user ini
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }
      if (transaction.user_id !== userId) {
        return res.status(403).json({ error: 'Tidak memiliki akses ke transaksi ini' });
      }

      const affectedRows = await Transaction.update(id, userId, data);
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }
      res.json({ status: 'ok', message: 'Transaksi berhasil diupdate' });
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

      // Verifikasi bahwa transaksi milik user ini
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }
      if (transaction.user_id !== userId) {
        return res.status(403).json({ error: 'Tidak memiliki akses ke transaksi ini' });
      }

      const affectedRows = await Transaction.delete(id, userId);
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }
      res.json({ status: 'ok', message: 'Transaksi berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getStats(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;
      const income = await Transaction.getTotalByType(userId, 'income');
      const expense = await Transaction.getTotalByType(userId, 'expense');
      res.json({ status: 'ok', income, expense, balance: income - expense });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = TransactionController;