import { useContext, useState, useMemo } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { calcTotals } from "../../logic/transactionsLogic";
import { formatRp } from "../../logic/format";
import { attachSpentToBudgets, summarizeBudgets, getBudgetStatus, sortBudgetsByRemaining } from "../../logic/budgetLogic";
import { TrendingUp, TrendingDown, Target, X, Plus } from 'lucide-react';
import './Dashboard.css';

const INCOME_CATEGORIES = ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makan', 'Transportasi', 'Hiburan', 'Kesehatan', 'Belanja', 'Utilitas', 'Lainnya'];
const COLORS = ['#3b82f6', '#ec4899', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

function Dashboard() {
  const { transactions, addTransaction, budgets } = useContext(TransactionContext);
  const { income, expense, balance } = calcTotals(transactions);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '',
    category: '', 
    customCategory: '',
    amount: '', 
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  function openModal(type) {
    setModalType(type);
    setShowModal(true);
    setIsCustomCategory(false);
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setFormData({ 
      name: '',
      category: categories[0], 
      customCategory: '',
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  }

  function closeModal() {
    setShowModal(false);
    setModalType(null);
    setIsCustomCategory(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    const finalCategory = isCustomCategory ? formData.customCategory : formData.category;
    
    if (!formData.name || !finalCategory || !formData.amount) {
      alert('Isi semua field (Nama, Kategori, Jumlah)');
      return;
    }

    const newTx = {
      id: crypto.randomUUID(),
      type: modalType,
      name: formData.name,
      category: finalCategory,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes
    };
    addTransaction(newTx);
    closeModal();
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleCategoryChange(e) {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '', customCategory: '' }));
    } else {
      setIsCustomCategory(false);
      setFormData(prev => ({ ...prev, category: value, customCategory: '' }));
    }
  }

  const categories = modalType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const placeholderName = modalType === 'income' ? 'Contoh: Gaji Bulanan' : 'Contoh: Belanja Bulanan';

  return (
    <div className="app-container">
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Ringkasan keuangan Anda</p>
          </div>
          <div className="page-header-actions">
            <button 
              className="btn btn-success"
              onClick={() => openModal('income')}
            >
              <Plus width={18} height={18} />
              Pendapatan
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => openModal('expense')}
            >
              <Plus width={18} height={18} />
              Pengeluaran
            </button>
          </div>
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
              <button className="btn btn-success btn-lg" onClick={() => openModal('income')}>
                <Plus width={20} height={20} /> Tambah Pendapatan
              </button>
              <button className="btn btn-danger btn-lg" onClick={() => openModal('expense')}>
                <Plus width={20} height={20} /> Tambah Pengeluaran
              </button>
            </div>
          </section>
        ) : (
          <DashboardContent
            transactions={transactions}
            income={income}
            expense={expense}
            balance={balance}
            budgets={budgets}
          />
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{
              background: modalType === 'income' ? '#22c55e' : '#ef4444',
              color: '#fff',
              borderRadius: '12px 12px 0 0'
            }}>
              <h2 className="modal-title" style={{ color: '#fff' }}>
                {modalType === 'income' ? 'Tambah Pendapatan' : 'Tambah Pengeluaran'}
              </h2>
              <button className="modal-close" onClick={closeModal} style={{ color: '#fff' }}>
                <X width={20} height={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Transaksi <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder={placeholderName}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jumlah (Rp) <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', color: '#6b7280' }}>Rp</span>
                  <input
                    type="number"
                    name="amount"
                    placeholder="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kategori <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  name="category"
                  value={isCustomCategory ? 'custom' : formData.category}
                  onChange={handleCategoryChange}
                  className="form-input"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="custom">+ Kategori Baru</option>
                </select>
              </div>

              {isCustomCategory && (
                <div className="form-group">
                  <label className="form-label">Nama Kategori Baru <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="customCategory"
                    placeholder="Masukkan nama kategori"
                    value={formData.customCategory}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tanggal <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catatan (Opsional)</label>
                <textarea
                  name="notes"
                  placeholder="Tambahkan catatan untuk transaksi ini..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="3"
                  style={{ resize: 'vertical' }}
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

function DashboardContent({ transactions, income, expense, balance, budgets }) {
  const budgetsWithSpent = useMemo(() => {
    const mappedBudgets = (budgets || []).map((b) => ({ ...b, id: b.id ?? b.category }));
    const expenseTx = transactions
      .filter((t) => t.type === 'expense')
      .map((t) => ({ budgetId: t.category, amount: t.amount, type: t.type }));
    return sortBudgetsByRemaining(attachSpentToBudgets(mappedBudgets, expenseTx));
  }, [budgets, transactions]);

  const budgetsTotals = useMemo(() => {
    const summary = summarizeBudgets(budgetsWithSpent);
    const spent = budgetsWithSpent.reduce((s, b) => s + (b.spent || 0), 0);
    return { total: summary.total, spent, remaining: summary.total - spent };
  }, [budgetsWithSpent]);

  const chartTransactions = transactions;
  const totalChartAmount = chartTransactions.reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  function generateDonutChart() {
    if (!chartTransactions.length || totalChartAmount === 0) {
      return (
        <circle cx="100" cy="100" r="65" fill="none" stroke="#e5e7eb" strokeWidth="30" />
      );
    }

    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercentage = 0;

    return chartTransactions.map((tx, index) => {
      const amount = Math.abs(tx.amount || 0);
      const percentage = totalChartAmount === 0 ? 0 : (amount / totalChartAmount) * 100;
      const strokeDasharray = (percentage / 100) * circumference;
      const strokeDashoffset = -(cumulativePercentage / 100) * circumference;
      cumulativePercentage += percentage;
      const color = COLORS[index % COLORS.length];

      return (
        <circle
          key={tx.id}
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
  }

  const recentTransactions = transactions.slice(-6);

  return (
    <div className="dashboard-content">
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

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Anggaran</span>
          </div>
          <div className="stat-value">{formatRp(budgetsTotals.total)}</div>
          <div className="stat-subtext">Terpakai: {formatRp(budgetsTotals.spent)} • Sisa: {formatRp(budgetsTotals.remaining)}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="card-title">Distribusi Transaksi</h3>
          <div className="chart-placeholder">
            <svg viewBox="0 0 200 200" width="220" height="220" className="donut-chart">
              {generateDonutChart()}
            </svg>
          </div>
          <div className="chart-stats">
            <div className="total-expense">Total: <strong>{formatRp(totalChartAmount)}</strong></div>
          </div>
          <div className="chart-legend">
            {chartTransactions.length === 0 && (
              <div className="legend-item">
                <span className="legend-label" style={{ color: '#6b7280' }}>Belum ada transaksi</span>
              </div>
            )}
            {chartTransactions.map((tx, idx) => {
              const amount = Math.abs(tx.amount || 0);
              const percentage = totalChartAmount === 0 ? 0 : ((amount / totalChartAmount) * 100).toFixed(1);
              return (
                <div key={tx.id} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <div className="legend-info">
                    <span className="legend-label">{tx.name || tx.category || 'Transaksi'}</span>
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
            <h3 className="card-title">Status Anggaran</h3>
            <a href="#" className="link-primary">Kelola Anggaran</a>
          </div>
          {budgetsWithSpent.length === 0 ? (
            <div className="empty-state small">Belum ada anggaran</div>
          ) : (
            <div className="budget-status-list">
              {budgetsWithSpent.slice(0, 4).map((b) => {
                const status = getBudgetStatus(b.amount || 0, b.spent || 0);
                const pct = b.amount ? Math.min(100, Math.round((b.spent / b.amount) * 100)) : 0;
                const badgeClass = status.status === 'over' ? 'badge-over' : status.status === 'warn' ? 'badge-warn' : 'badge-safe';
                return (
                  <div key={b.id} className="budget-status-item">
                    <div>
                      <div className="budget-status-title">{b.category || b.name}</div>
                      <div className="budget-status-meta">{formatRp(b.spent)} / {formatRp(b.amount || 0)}</div>
                    </div>
                    <div className="budget-status-right">
                      <span className={`budget-badge ${badgeClass}`}>{status.status === 'over' ? 'Over' : status.status === 'warn' ? 'Hampir' : 'Aman'}</span>
                      <div className="budget-progress mini">
                        <div className="budget-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  <div className="transaction-description">{tx.name || tx.category}</div>
                  <div className="transaction-date">{tx.date} • {tx.category}</div>
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