import { useContext, useMemo } from 'react';
import { TransactionContext } from '../../context/TransactionContext';
import { formatRp } from '../../logic/format';
import { attachSpentToBudgets, summarizeBudgets, getBudgetStatus, sortBudgetsByRemaining } from '../../logic/budgetLogic';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';
import './Anggaran.css';

const INCOME_CATEGORIES = ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makan', 'Transportasi', 'Hiburan', 'Kesehatan', 'Belanja', 'Utilitas', 'Lainnya'];

export default function Anggaran() {
  const { budgets, addBudget, updateBudget, deleteBudget, transactions } = useContext(TransactionContext);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // budget id atau null
  const [form, setForm] = useState({ name: '', category: '', amount: '', period: 'Bulanan' });

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

  function openAdd() {
    setEditing(null);
    setForm({ name: '', category: '', amount: '', period: 'Bulanan' });
    setShowModal(true);
  }

  function openEdit(b) {
    setEditing(b.id);
    // Memastikan form terisi dengan data yang ada
    setForm({ 
        name: b.name || b.category || '', 
        category: b.category || '', 
        amount: b.amount || '', 
        period: b.period || 'Bulanan' 
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Basic client-side validation
    const nameOrCategory = (form.name || form.category || '').trim();
    const amountNum = Number(form.amount);
    if (!nameOrCategory) {
      alert('Nama atau kategori harus diisi.');
      return;
    }
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      alert('Jumlah anggaran harus di angka lebih besar dari 0.');
      return;
    }

    const payload = {
      id: editing || crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category.trim() || form.name.trim(), // Fallback category ke name
      amount: amountNum,
      period: form.period || 'Bulanan'
    };

    try {
      if (editing) {
        await updateBudget(editing, payload);
      } else {
        await addBudget(payload);
      }
      // reset form and close
      setForm({ name: '', category: '', amount: '', period: 'Bulanan' });
      setShowModal(false);
    } catch (err) {
      console.error('Budget save failed', err);
      alert(err.message || 'Gagal menyimpan anggaran');
    }
  }

  function handleDelete(id) {
    if (confirm('Hapus anggaran ini?')) {
      deleteBudget(id);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Anggaran</h1>
          <p className="page-subtitle">Tetapkan dan lacak anggaran Anda</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={openAdd}><PlusCircle/> Tambah Anggaran</button>
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
          <div className="empty-state">
              <h3 style={{color: '#6c757d'}}>Tidak Ada Anggaran Ditetapkan</h3>
              <p style={{color: '#868e96'}}>Kelola keuangan Anda lebih baik dengan menetapkan anggaran.</p>
              <button className="btn btn-primary" onClick={openAdd} style={{marginTop: '15px'}}><PlusCircle size={16}/> Buat Anggaran Pertama</button>
          </div>
        ) : budgetsWithSpent.map(b => {
          const status = getBudgetStatus(b.amount || 0, b.spent || 0);
          const pct = b.amount ? Math.min(100, Math.round((b.spent / b.amount) * 100)) : 0;
          const badgeClass = status.status === 'over' ? 'badge-over' : status.status === 'warn' ? 'badge-warn' : 'badge-safe';
          
          // Menentukan warna progress fill berdasarkan status (sesuai dengan anggran.css)
          const progressColor = 
            status.status === 'over' ? '#b91c1c' : // Merah
            status.status === 'warn' ? '#92400e' : // Kuning
            '#166534'; // Hijau

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
                  <button onClick={() => openEdit(b)} title="Edit"><Edit3 size={18}/></button>
                  <button onClick={() => handleDelete(b.id)} title="Hapus"><Trash2 size={18}/></button>
                </div>
              </div>

              <div className="budget-body">
                <div className="budget-amount">{formatRp(b.spent)} / {formatRp(b.amount)}</div>
                <div className="budget-progress">
                  <div className="budget-progress-fill" style={{ width: `${pct}%`, backgroundColor: progressColor }} />
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
      
      {/* Modal for add/edit budget */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Anggaran' : 'Tambah Anggaran'}</h3>
            <form onSubmit={handleSubmit} className="budget-form">
              <div className="form-group full">
                <label>Nama</label>
                <input type="text" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
              </div>
              
              <div className="form-group">
                <label>Kategori</label>
                <select value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}>
                  <option value="">-- Pilih Kategori --</option>
                  {Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...(budgets || []).map(b => b.category || b.name)])).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Jumlah (Rp)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))} required />
              </div>

              <div className="form-group full">
                <label>Periode</label>
                <select value={form.period} onChange={(e) => setForm(prev => ({ ...prev, period: e.target.value }))}>
                  <option>Bulanan</option>
                  <option>Tahunan</option>
                  <option>Satu Kali</option>
                </select>
              </div>

              <div className="actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}