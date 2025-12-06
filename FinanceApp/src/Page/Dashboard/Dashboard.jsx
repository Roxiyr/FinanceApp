import { useContext, useState } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { calcTotals } from "../../logic/transactionsLogic";
import { TrendingUp, TrendingDown, Target, X } from 'lucide-react';
import './Dashboard.css';

const INCOME_CATEGORIES = ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makan', 'Transportasi', 'Hiburan', 'Kesehatan', 'Belanja', 'Utilitas', 'Lainnya'];
const COLORS = ['#3b82f6', '#ec4899', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

function Dashboard() {
  const { transactions, addTransaction } = useContext(TransactionContext);
  const { income, expense, balance } = calcTotals(transactions);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({ category: '', amount: '', date: new Date().toISOString().split('T')[0] });

  function openModal(type) {
    setModalType(type);
    setShowModal(true);
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setFormData({ category: categories[0], amount: '', date: new Date().toISOString().split('T')[0] });
  }

  function closeModal() {
    setShowModal(false);
    setModalType(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      alert('Isi semua field');
      return;
    }

    const newTx = {
      id: crypto.randomUUID(),
      type: modalType,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
    };
    addTransaction(newTx);
    closeModal();
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const categories = modalType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#fff" />
                <path d="M6 12h12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="logo-text">FinanceApp</div>
          </div>

          <nav className="nav-menu" aria-label="Main navigation">
            <button className="nav-item nav-item-active">Dashboard</button>
            <button className="nav-item">Pendapatan</button>
            <button className="nav-item">Pengeluaran</button>
            <button className="nav-item">Anggaran</button>
            <button className="nav-item">Laporan</button>
            <button className="nav-item">Pengaturan</button>
            <button className="nav-item nav-item-danger">Keluar</button>
          </nav>

          <div className="action-buttons">
            <button className="btn btn-success" onClick={() => openModal('income')}>+ Pendapatan</button>
            <button className="btn btn-danger" onClick={() => openModal('expense')}>+ Pengeluaran</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan keuangan Anda</p>
        </header>

        {transactions.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon-wrapper">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" width="64" height="64">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="#93c5fd" strokeWidth="1.5" />
                <circle cx="17" cy="12" r="1.6" fill="#93c5fd" />
              </svg>
              <div className="empty-icon-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <h2 className="empty-title">Belum Ada Transaksi</h2>
            <p className="empty-description">
              Mulai kelola keuangan Anda dengan menambahkan transaksi pertama. Catat pendapatan dan pengeluaran untuk melihat ringkasan keuangan Anda.
            </p>

            <div className="empty-actions">
              <button className="btn btn-success btn-lg" onClick={() => openModal('income')}>+ Tambah Pendapatan</button>
              <button className="btn btn-danger btn-lg" onClick={() => openModal('expense')}>+ Tambah Pengeluaran</button>
            </div>

            <a className="link-button">Atau lihat contoh data</a>
          </section>
        ) : (
          <DashboardContent transactions={transactions} income={income} expense={expense} balance={balance} />
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalType === 'income' ? 'Tambah Pendapatan' : 'Tambah Pengeluaran'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <X width={20} height={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Jumlah (Rp)</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className={`btn ${modalType === 'income' ? 'btn-success' : 'btn-danger'}`}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardContent({ transactions, income, expense, balance }) {
  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // Hitung pengeluaran per kategori
  function getExpenseByCategory() {
    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    return categoryTotals;
  }

  // Generate SVG donut chart - FULL LINGKARAN dengan segment berdasarkan persentase
  function generateDonutChart() {
    const categoryTotals = getExpenseByCategory();
    const entries = Object.entries(categoryTotals);
    
    if (entries.length === 0) {
      return (
        <circle cx="100" cy="100" r="65" fill="none" stroke="#e5e7eb" strokeWidth="30" />
      );
    }

    const total = entries.reduce((sum, [_, amount]) => sum + amount, 0);
    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    
    let cumulativePercentage = 0;
    
    // Buat lingkaran FULL dengan segment warna per kategori
    const circles = entries.map(([category, amount], index) => {
      const percentage = (amount / total) * 100;
      const strokeDasharray = (percentage / 100) * circumference;
      const strokeDashoffset = -(cumulativePercentage / 100) * circumference;
      
      cumulativePercentage += percentage;
      const color = COLORS[index % COLORS.length];
      
      return (
        <circle
          key={category}
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="30"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="chart-segment"
        />
      );
    });
    
    return circles;
  }

  // Tampilkan hanya 6 transaksi terbaru
  const recentTransactions = transactions.slice(-6);
  const expenseByCategory = getExpenseByCategory();
  const categoryKeys = Object.keys(expenseByCategory);
  const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="dashboard-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Pendapatan</span>
            <TrendingUp className="stat-icon stat-icon-success" width={20} height={20} />
          </div>
          <div className="stat-value stat-value-success">{formatRp(income)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Pengeluaran</span>
            <TrendingDown className="stat-icon stat-icon-danger" width={20} height={20} />
          </div>
          <div className="stat-value stat-value-danger">-{formatRp(expense)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Saldo Tersisa</span>
            <Target className="stat-icon stat-icon-primary" width={20} height={20} />
          </div>
          <div className="stat-value">{formatRp(balance)}</div>
        </div>
      </div>

      {/* Chart & Transactions */}
      <div className="dashboard-grid">
        <div className="card">
          <h3 className="card-title">Pengeluaran per Kategori</h3>
          <div className="chart-placeholder">
            <svg viewBox="0 0 200 200" width="220" height="220" className="donut-chart">
              {generateDonutChart()}
            </svg>
          </div>
          <div className="chart-stats">
            <div className="total-expense">Total: <strong>{formatRp(totalExpense)}</strong></div>
          </div>
          <div className="chart-legend">
            {categoryKeys.map((category, idx) => {
              const amount = expenseByCategory[category];
              const percentage = ((amount / totalExpense) * 100).toFixed(1);
              return (
                <div key={category} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <div className="legend-info">
                    <span className="legend-label">{category}</span>
                    <span className="legend-percentage">{percentage}%</span>
                  </div>
                  <span className="legend-value">{formatRp(amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="transactions-header">
            <h3 className="card-title">Transaksi Terbaru</h3>
            <a href="#" className="link-primary">Lihat Semua</a>
          </div>
          <div className="transactions-list">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className={`transaction-icon ${tx.type === 'income' ? 'transaction-icon-success' : 'transaction-icon-danger'}`}>
                  {tx.type === 'income' ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />}
                </div>
                <div className="transaction-info">
                  <div className="transaction-description">{tx.category}</div>
                  <div className="transaction-date">{tx.date}</div>
                </div>
                <div className={`transaction-amount ${tx.type === 'income' ? 'transaction-amount-success' : 'transaction-amount-danger'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRp(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;