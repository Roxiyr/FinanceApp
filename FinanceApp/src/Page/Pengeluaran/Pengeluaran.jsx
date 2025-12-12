import { useContext, useState } from 'react';
import { TransactionContext } from '../../context/TransactionContext';
import { formatRp } from '../../logic/format';
import { TrendingDown, Trash2, Edit2, X } from 'lucide-react';
import './Pengeluaran.css';

const EXPENSE_CATEGORIES = ['Makan', 'Transportasi', 'Hiburan', 'Kesehatan', 'Belanja', 'Utilitas', 'Lainnya'];

export default function Pengeluaran() {
  const { transactions, deleteTransaction, updateTransaction, budgets = [] } = useContext(TransactionContext);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  function startEdit(tx) {
    setEditingId(tx.id);
    setEditData({ ...tx });
    const merged = Array.from(new Set([...EXPENSE_CATEGORIES, ...(budgets || []).map(b => b.category || b.name)]));
    setIsCustomCategory(!merged.includes(tx.category));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData(null);
    setIsCustomCategory(false);
  }

  function saveEdit() {
    if (!editData.name || !editData.amount) {
      alert('Isi semua field');
      return;
    }
    updateTransaction(editingId, editData);
    cancelEdit();
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  }

  function handleCategoryChange(e) {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomCategory(true);
      setEditData(prev => ({ ...prev, category: '' }));
    } else {
      setIsCustomCategory(false);
      setEditData(prev => ({ ...prev, category: value }));
    }
  }

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Pengeluaran</h1>
          <p className="page-subtitle">Kelola semua pengeluaran Anda</p>
        </div>
        <div className="header-stats">
          <div className="stat-box expense-stat">
            <TrendingDown className="stat-icon-lg" width={24} height={24} />
            <div>
              <div className="stat-label-lg">Total Pengeluaran</div>
              <div className="stat-value-lg">{formatRp(totalExpense)}</div>
            </div>
          </div>
        </div>
      </div>

      {expenseTransactions.length === 0 ? (
        <div className="empty-card">
          <TrendingDown className="empty-icon" width={64} height={64} />
          <h3>Belum Ada Pengeluaran</h3>
          <p>Mulai catat pengeluaran Anda dari halaman Dashboard</p>
        </div>
      ) : (
        <div className="transactions-container">
          <div className="transactions-table">
            <div className="table-header">
              <div className="col-date">Tanggal</div>
              <div className="col-category">Nama / Kategori</div>
              <div className="col-amount">Jumlah</div>
              <div className="col-action">Aksi</div>
            </div>
            {expenseTransactions.map((tx) => (
              <div key={tx.id}>
                {editingId === tx.id ? (
                  <div className="edit-row">
                    <input 
                      type="date" 
                      name="date" 
                      value={editData.date} 
                      onChange={handleEditChange}
                      className="edit-input"
                    />
                    <div>
                      <input 
                        type="text" 
                        name="name" 
                        placeholder="Nama transaksi"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="edit-input"
                        style={{ marginBottom: '4px' }}
                      />
                      <select 
                        value={isCustomCategory ? 'custom' : editData.category}
                        onChange={handleCategoryChange}
                        className="edit-input"
                      >
                        {Array.from(new Set([...EXPENSE_CATEGORIES, ...(budgets || []).map(b => b.category || b.name)])).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="custom">+ Kategori Baru</option>
                      </select>
                      {isCustomCategory && (
                        <input 
                          type="text"
                          value={editData.category}
                          onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="Kategori baru"
                          className="edit-input"
                          style={{ marginTop: '4px' }}
                        />
                      )}
                    </div>
                    <input 
                      type="number" 
                      name="amount" 
                      value={editData.amount}
                      onChange={handleEditChange}
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button onClick={saveEdit} className="btn-save">Simpan</button>
                      <button onClick={cancelEdit} className="btn-cancel">Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="table-row expense-row">
                    <div className="col-date">{tx.date}</div>
                    <div className="col-category">
                      <div className="transaction-name">{tx.name}</div>
                      <span className="category-badge expense-badge">{tx.category}</span>
                    </div>
                    <div className="col-amount">{formatRp(tx.amount)}</div>
                    <div className="col-action">
                      <button 
                        onClick={() => startEdit(tx)}
                        className="btn-edit"
                        title="Edit"
                      >
                        <Edit2 width={16} height={16} />
                      </button>
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        className="btn-delete"
                        title="Hapus"
                      >
                        <Trash2 width={16} height={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}