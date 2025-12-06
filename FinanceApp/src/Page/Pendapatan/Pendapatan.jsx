import { useContext, useState } from 'react';
import { TransactionContext } from '../../context/TransactionContext';
import { formatRp } from '../../logic/format';
import { TrendingUp, Trash2, Edit2, X } from 'lucide-react';
import './Pendapatan.css';

const INCOME_CATEGORIES = ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'];

export default function Pendapatan() {
  const { transactions, deleteTransaction, updateTransaction } = useContext(TransactionContext);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  function startEdit(tx) {
    setEditingId(tx.id);
    setEditData({ ...tx });
    setIsCustomCategory(!INCOME_CATEGORIES.includes(tx.category));
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
          <h1 className="page-title">Pendapatan</h1>
          <p className="page-subtitle">Kelola semua pendapatan Anda</p>
        </div>
        <div className="header-stats">
          <div className="stat-box">
            <TrendingUp className="stat-icon-lg" width={24} height={24} />
            <div>
              <div className="stat-label-lg">Total Pendapatan</div>
              <div className="stat-value-lg">{formatRp(totalIncome)}</div>
            </div>
          </div>
        </div>
      </div>

      {incomeTransactions.length === 0 ? (
        <div className="empty-card">
          <TrendingUp className="empty-icon" width={64} height={64} />
          <h3>Belum Ada Pendapatan</h3>
          <p>Mulai catat pendapatan Anda dari halaman Dashboard</p>
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
            {incomeTransactions.map((tx) => (
              <div key={tx.id}>
                {editingId === tx.id ? (
                  // Mode Edit
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
                        {INCOME_CATEGORIES.map(cat => (
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
                  // Mode View
                  <div className="table-row income-row">
                    <div className="col-date">{tx.date}</div>
                    <div className="col-category">
                      <div className="transaction-name">{tx.name}</div>
                      <span className="category-badge income-badge">{tx.category}</span>
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