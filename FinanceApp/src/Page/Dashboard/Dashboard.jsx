import { useContext, useState, useMemo } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { calcTotals } from "../../logic/transactionsLogic";
import { formatRp } from "../../logic/format";
import { attachSpentToBudgets, summarizeBudgets, getBudgetStatus, sortBudgetsByRemaining } from "../../logic/budgetLogic";
import { TrendingUp, TrendingDown, Target, X, Plus } from 'lucide-react';
import './Dashboard.css';

const INCOME_CATEGORIES = ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makan', 'Transportasi', 'Hiburan', 'Kesehatan', 'Belanja', 'Utilitas', 'Lainnya'];

// Warna untuk Donut Chart
const CHART_COLORS = ['#3b82f6', '#ec4899', '#a855f7', '#f59e0b', '#06b6d4', '#10b981', '#6b7280']; 
const CHART_RADIUS = 65; // Radius untuk perhitungan SVG

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
    const categories = type === 'income'
      ? INCOME_CATEGORIES
      : Array.from(new Set([...EXPENSE_CATEGORIES, ...(budgets || []).map(b => b.category || b.name)]) );
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

  const categories = modalType === 'income'
    ? INCOME_CATEGORIES
    : Array.from(new Set([...EXPENSE_CATEGORIES, ...(budgets || []).map(b => b.category || b.name)]) );
  const placeholderName = modalType === 'income' ? 'Contoh: Gaji Bulanan' : 'Contoh: Belanja Bulanan';

  return (
    <div className="page-container">
      <div className="main-content">
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
      </div>

      {/* Modal ... (kode modal tidak berubah) */}
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

  // Data Chart: Hanya Pengeluaran, dikelompokkan berdasarkan kategori
  const donutChartData = useMemo(() => {
    const expenseTx = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenseTx.reduce((acc, tx) => {
      const category = tx.category || 'Lainnya'; 
      acc[category] = (acc[category] || 0) + tx.amount;
      return acc;
    }, {});

    const sortedData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount); // Mengurutkan dari yang terbesar

    return sortedData;
  }, [transactions]);
  
  const totalChartAmount = donutChartData.reduce((s, d) => s + d.amount, 0);


  function generateDonutChart() {
    if (!donutChartData.length || totalChartAmount === 0) {
      // Background abu-abu jika tidak ada data
      return (
        <circle cx="100" cy="100" r={CHART_RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="30" />
      );
    }

    const radius = CHART_RADIUS;
    const strokeWidth = 30; // Lebar Donut
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    return donutChartData.map((data, index) => {
      const amount = data.amount;
      const percentage = totalChartAmount === 0 ? 0 : (amount / totalChartAmount); // Proporsi (0.0 hingga 1.0)
      
      const segmentLength = percentage * circumference;
      // Padding kecil antar segmen (misalnya 2 piksel di circumference)
      const paddingLength = 4; 
      
      const strokeDasharray = `${Math.max(0, segmentLength - paddingLength)}, ${circumference - segmentLength + paddingLength}`;
      
      const color = CHART_COLORS[index % CHART_COLORS.length];

      const segmentElement = (
        <circle
          key={data.category} 
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          // Offset diputar 90 derajat ke belakang (-0.25 * circumference) agar dimulai dari atas
          strokeDashoffset={-cumulativeOffset - (0.25 * circumference)} 
          strokeLinecap="round" // Membuat ujungnya membulat
          className="chart-segment"
        />
      );

      cumulativeOffset += segmentLength; // Tambahkan panjang segmen saat ini
      return segmentElement;
    });
  }

  const recentTransactions = transactions.slice(-6).sort((a, b) => new Date(b.date) - new Date(a.date));

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
          <h3 className="card-title">Distribusi Pengeluaran</h3>
          <div className="chart-placeholder">
            <svg viewBox="0 0 200 200" width="220" height="220" className="donut-chart" style={{ transform: 'rotate(-90deg)' }}> 
                {/* Latar belakang abu-abu penuh */}
                <circle cx="100" cy="100" r={CHART_RADIUS} fill="none" stroke="#f3f4f6" strokeWidth="30" />
                
                {/* Segmen Donut */}
                {generateDonutChart()}
                
                {/* Kembalikan rotasi label agar tidak terbalik */}
                <g style={{ transform: 'rotate(90deg)' }}> 
                    {/* Tambahkan Teks atau Tooltip di tengah jika diperlukan */}
                </g>
            </svg>
          </div>
          <div className="chart-stats">
            <div className="total-expense">Total Pengeluaran: <strong>{formatRp(totalChartAmount)}</strong></div>
          </div>
          <div className="chart-legend">
            {donutChartData.length === 0 && (
              <div className="legend-item">
                <span className="legend-label" style={{ color: '#6b7280' }}>Belum ada pengeluaran yang dicatat</span>
              </div>
            )}
            {donutChartData.map((data, idx) => {
              const amount = data.amount;
              const percentage = totalChartAmount === 0 ? 0 : ((amount / totalChartAmount) * 100).toFixed(1);
              return (
                <div key={data.category} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
                  <div className="legend-info">
                    <span className="legend-label">{data.category}</span> 
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