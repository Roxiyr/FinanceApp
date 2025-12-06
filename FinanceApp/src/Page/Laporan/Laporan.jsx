import { useContext } from 'react';
import { TransactionContext } from '../../context/TransactionContext';
import { calcTotals } from '../../logic/transactionsLogic';
import { formatRp, calculatePercent, formatPercent } from '../../logic/format';
import { BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react';
import './Laporan.css';

export default function Laporan() {
  const { transactions } = useContext(TransactionContext);
  const { income, expense, balance } = calcTotals(transactions);

  function getExpenseByCategory() {
    const categoryTotals = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    return categoryTotals;
  }

  const expenseByCategory = getExpenseByCategory();
  const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="page-container">
      <div className="page-header-simple">
        <h1 className="page-title">Laporan Keuangan</h1>
        <p className="page-subtitle">Analisis ringkas keuangan Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card income-card">
          <div className="summary-icon">
            <TrendingUp width={24} height={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Pendapatan</div>
            <div className="summary-value income-value">{formatRp(income)}</div>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="summary-icon">
            <TrendingDown width={24} height={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Pengeluaran</div>
            <div className="summary-value expense-value">{formatRp(expense)}</div>
          </div>
        </div>

        <div className="summary-card balance-card">
          <div className="summary-icon">
            <Target width={24} height={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Saldo Bersih</div>
            <div className={`summary-value ${balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
              {formatRp(balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="breakdown-section">
        <h2 className="section-title">Rincian Pengeluaran</h2>
        
        {Object.keys(expenseByCategory).length === 0 ? (
          <div className="empty-breakdown">
            <BarChart3 width={48} height={48} />
            <p>Belum ada data pengeluaran untuk ditampilkan</p>
          </div>
        ) : (
          <div className="breakdown-list">
            {Object.entries(expenseByCategory).map(([category, amount]) => {
              const percentage = calculatePercent(amount, totalExpense);
              return (
                <div key={category} className="breakdown-item">
                  <div className="breakdown-info">
                    <div className="breakdown-name">{category}</div>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-progress"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="breakdown-stats">
                    <span className="breakdown-percentage">{formatPercent(percentage)}</span>
                    <span className="breakdown-amount">{formatRp(amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaksi Bulan Ini */}
      <div className="breakdown-section">
        <h2 className="section-title">Transaksi Terbaru</h2>
        
        {transactions.length === 0 ? (
          <div className="empty-breakdown">
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <div className="recent-transactions">
            {transactions.slice().reverse().slice(0, 10).map((tx) => (
              <div key={tx.id} className={`recent-item ${tx.type}`}>
                <div className="recent-info">
                  <div className="recent-category">{tx.category}</div>
                  <div className="recent-date">{tx.date}</div>
                </div>
                <div className={`recent-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRp(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}