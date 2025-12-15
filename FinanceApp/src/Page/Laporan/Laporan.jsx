import { useContext, useMemo } from 'react';
import { TransactionContext } from '../../context/TransactionContext';
import { calcTotals } from '../../logic/transactionsLogic';
// PERBAIKAN: Hanya mengimpor formatRp
import { formatRp } from '../../logic/format'; 
import { summarizeBudgets } from '../../logic/budgetLogic';
import { BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react';
import BarChart from '../../components/BarChart';
import './Laporan.css';

export default function Laporan() {
  const { transactions, budgets } = useContext(TransactionContext);
  // calcTotals menghasilkan income, expense, balance
  const { income, expense, balance } = calcTotals(transactions); 

  const budgetSummary = useMemo(() => {
    const { total, count } = summarizeBudgets(budgets);
    const spent = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    return { total, spent, remaining: total - spent, count };
  }, [budgets, transactions]);

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

  // const totalIncome = transactions.reduce((s,t)=> t.type==='income' ? s + Number(t.amount) : s, 0);
  // const net = totalIncome - totalExpense;

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

        <div className="summary-card budget-card">
          <div className="summary-icon">
            <BarChart3 width={24} height={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Anggaran ({budgetSummary.count})</div>
            <div className="summary-value">{formatRp(budgetSummary.total)}</div>
            <div className="summary-subtext">
              Terpakai: {formatRp(budgetSummary.spent)} • Sisa: {formatRp(budgetSummary.remaining)}
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
          <div style={{ paddingTop: 8 }}>
            <BarChart
              data={Object.entries(expenseByCategory).map(([category, amount], idx) => ({
                label: category,
                value: amount,
                color: ["#2563eb", "#ec4899", "#a855f7", "#22c55e", "#f59e0b"][idx % 5],
                format: (v) => formatRp(v)
              }))}
              width={780}
              labelWidth={180}
            />
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