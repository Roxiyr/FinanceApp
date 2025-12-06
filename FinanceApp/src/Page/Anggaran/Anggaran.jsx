import { useContext, useMemo } from 'react';
import { TransactionContext } from '../../context/TransactionContext';
import { formatRp } from '../../logic/format';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import './Anggaran.css';

export default function Anggaran() {
  const { budgets, addBudget, updateBudget, deleteBudget, transactions } = useContext(TransactionContext);

  const expenseByCategory = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  }, [transactions]);

  // simple add demo budget (you can replace with modal form)
  function handleAddDemo() {
    addBudget({
      id: crypto.randomUUID(),
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
          <div className="summary-value">{formatRp(budgets.reduce((s,b)=> s + (b.amount||0),0))}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Terpakai</div>
          <div className="summary-value">
            {formatRp(transactions.filter(t=>t.type==='expense').reduce((s,t)=> s + t.amount,0))}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Sisa Anggaran</div>
          <div className="summary-value">
            {formatRp(budgets.reduce((s,b)=> s + (b.amount||0),0) - transactions.filter(t=>t.type==='expense').reduce((s,t)=> s + t.amount,0))}
          </div>
        </div>
      </div>

      <div className="budgets-grid">
        {budgets.length === 0 ? (
          <div className="empty-card">Belum ada anggaran. Klik Tambah Anggaran.</div>
        ) : budgets.map(b => {
          const used = expenseByCategory[b.category] || 0;
          const pct = b.amount ? Math.min(100, Math.round((used / b.amount) * 100)) : 0;
          return (
            <div key={b.id} className="budget-card">
              <div className="budget-header">
                <div>
                  <div className="budget-category">{b.category}</div>
                  <div className="budget-meta">{b.period}</div>
                </div>
                <div className="budget-actions">
                  <button onClick={() => updateBudget(b.id, { amount: b.amount })} title="Edit"><Edit3/></button>
                  <button onClick={() => deleteBudget(b.id)} title="Hapus"><Trash2/></button>
                </div>
              </div>

              <div className="budget-body">
                <div className="budget-amount">{formatRp(used)} / {formatRp(b.amount)}</div>
                <div className="budget-progress">
                  <div className="budget-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-footer">
                  <div className="budget-percent">{pct}%</div>
                  <div className="budget-remaining">{formatRp(Math.max(0, b.amount - used))} sisa</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}