
/**
 * Hitung total anggaran dan jumlah item.
 * @param {Array<{id?:number|string, amount:number}>} budgets
 * @returns {{count:number,total:number}}
 */
export function summarizeBudgets(budgets = []) {
  const total = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  return { count: budgets.length, total };
}

/**
 * Gabungkan transaksi ke anggaran: hitung total pengeluaran per anggaran.
 * @param {Array<{id:number|string, amount:number}>} budgets
 * @param {Array<{budgetId?:number|string, amount:number, type?:'expense'|'income'}>} transactions
 * @returns {Array<{id, amount, spent:number, remaining:number}>}
 */
export function attachSpentToBudgets(budgets = [], transactions = []) {
  // Be tolerant: transactions may reference a budget by id or by category string.
  // We'll compute spent per budget by matching transaction.budgetId or transaction.category
  // against both budget.id and budget.category.
  return budgets.map((b) => {
    const spent = transactions.reduce((s, tx) => {
      if (tx.type && tx.type !== 'expense') return s;
      const txRef = tx.budgetId ?? tx.category ?? null;
      if (txRef == null) return s;
      const matches = String(txRef) === String(b.id) || String(txRef) === String(b.category) || String(tx.category) === String(b.id) || String(tx.category) === String(b.category);
      if (matches) return s + (Number(tx.amount) || 0);
      return s;
    }, 0);
    const remaining = (Number(b.amount) || 0) - spent;
    return { ...b, spent, remaining };
  });
}

/**
 * Hitung status/warna indikator berdasarkan persentase penggunaan.
 * @param {number} amount total anggaran
 * @param {number} spent jumlah terpakai
 * @returns {{percent:number,status:'safe'|'warn'|'over'}}
 */
export function getBudgetStatus(amount = 0, spent = 0) {
  const percent = amount > 0 ? Math.min(Math.max(spent / amount, 0), 2) : 0;
  if (percent >= 1) return { percent, status: 'over' };
  if (percent >= 0.8) return { percent, status: 'warn' };
  return { percent, status: 'safe' };
}

/**
 * Urutkan anggaran berdasar sisa terkecil (prioritas pengawasan).
 * @param {Array<{amount:number, spent?:number}>} budgets
 * @returns {Array}
 */
export function sortBudgetsByRemaining(budgets = []) {
  return [...budgets].sort((a, b) => {
    const ra = (Number(a.amount) || 0) - (Number(a.spent) || 0);
    const rb = (Number(b.amount) || 0) - (Number(b.spent) || 0);
    return ra - rb;
  });
}
