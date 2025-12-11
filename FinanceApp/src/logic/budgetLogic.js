// Utility helpers untuk logika anggaran
// Semua fungsi pure (tidak mengubah input) agar mudah di-test dan dipakai ulang.

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
  const spentPerBudget = transactions.reduce((acc, tx) => {
    // default: hanya hitung expense, abaikan income
    if (tx.type && tx.type !== 'expense') return acc;
    if (!tx.budgetId) return acc;
    acc[tx.budgetId] = (acc[tx.budgetId] || 0) + (Number(tx.amount) || 0);
    return acc;
  }, {});

  return budgets.map((b) => {
    const spent = spentPerBudget[b.id] || 0;
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
