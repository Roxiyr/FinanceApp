import { useContext, useMemo } from 'react';
import { TransactionContext } from '../../context/TransactionContext';
import { formatRp } from '../../logic/format';
import { attachSpentToBudgets, summarizeBudgets, getBudgetStatus, sortBudgetsByRemaining } from '../../logic/budgetLogic';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import './Anggaran.css';

export default function Anggaran() {
  const { budgets, addBudget, updateBudget, deleteBudget, transactions } = useContext(TransactionContext);

  const budgetsWithSpent = useMemo(() => {
    const mappedBudgets = budgets.map((b) => ({
      ...b,
      id: b.id ?? b.category, // fallback untuk perhitungan
    }));
    const expenseTx = transactions
      .filter((t) => t.type === 'expense')
      .map((t) => ({
        budgetId: t.category, // pakai kategori sebagai pengelompokan anggaran
        amount: t.amount,
        type: t.type,
      }));
    const withSpent = attachSpentToBudgets(mappedBudgets, expenseTx);
    return sortBudgetsByRemaining(withSpent);
  }, [budgets, transactions]);

  const totals = useMemo(() => {
    const { total } = summarizeBudgets(budgets);
    const spent = transactions.filter(t => t.type === 'expense')
      .reduce((s, t) => s + (t.amount || 0), 0);
    return { totalBudget: total, totalSpent: spent, remaining: total - spent };
  }, [budgets, transactions]);

  // simple add demo budget (you can replace with modal form)
  function handleAddDemo() {
    addBudget({
      id: crypto.randomUUID(),
      name: 'Makanan',
      category: 'Makanan',
      amount: 500000,
      period: 'Bulanan'
    });
  }

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Anggaran</h1>
          <p className="page-subtitle">Tetapkan dan lacak anggaran Anda</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleAddDemo}><PlusCircle/> Tambah Anggaran</button>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-label">Total Anggaran</div>
          <div className="summary-value">{formatRp(totals.totalBudget)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Terpakai</div>
          <div className="summary-value">
            {formatRp(totals.totalSpent)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Sisa Anggaran</div>
          <div className="summary-value">
            {formatRp(totals.remaining)}
          </div>
        </div>
      </div>

      <div className="budgets-grid">
        {budgetsWithSpent.length === 0 ? (
          <div className="empty-card">Belum ada anggaran. Klik Tambah Anggaran.</div>
        ) : budgetsWithSpent.map(b => {
          const status = getBudgetStatus(b.amount || 0, b.spent || 0);
          const pct = b.amount ? Math.min(100, Math.round((b.spent / b.amount) * 100)) : 0;
          const badgeClass = status.status === 'over' ? 'badge-over' : status.status === 'warn' ? 'badge-warn' : 'badge-safe';
          return (
            <div key={b.id} className="budget-card">
              <div className="budget-header">
                <div>
                  <div className="budget-category">{b.category || b.name}</div>
                  <div className="budget-meta">{b.period || 'N/A'}</div>
                </div>
                <div className="budget-actions">
                  <span className={`budget-badge ${badgeClass}`}>
                    {status.status === 'over' ? 'Over' : status.status === 'warn' ? 'Hampir' : 'Aman'}
                  </span>
                  <button onClick={() => updateBudget(b.id, { amount: b.amount })} title="Edit"><Edit3/></button>
                  <button onClick={() => deleteBudget(b.id)} title="Hapus"><Trash2/></button>
                </div>
              </div>

              <div className="budget-body">
                <div className="budget-amount">{formatRp(b.spent)} / {formatRp(b.amount)}</div>
                <div className="budget-progress">
                  <div className="budget-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-footer">
                  <div className="budget-percent">{pct}%</div>
                  <div className="budget-remaining">{formatRp(Math.max(0, (b.amount || 0) - (b.spent || 0)))} sisa</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}