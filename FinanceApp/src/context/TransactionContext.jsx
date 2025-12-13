import { createContext, useState, useEffect } from "react";
import { useBudget } from "./BudgetContext";

export const TransactionContext = createContext();

function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState(() =>
    loadFromStorage('fa_transactions', [])
  );

  // budgets come from BudgetContext
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();

  // persist transactions
  useEffect(() => {
    try {
      localStorage.setItem('fa_transactions', JSON.stringify(transactions));
    } catch (err) {
      console.error('Gagal menyimpan transactions:', err);
    }
  }, [transactions]);

  function addTransaction(newTx) {
    setTransactions((prev) => [...prev, newTx]);
  }

  function updateTransaction(id, updates) {
    setTransactions((prev) => 
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter(tx => tx.id !== id));
  }

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      // expose budget API from BudgetContext for compatibility
      budgets,
      addBudget,
      updateBudget,
      deleteBudget
    }}>
      {children}
    </TransactionContext.Provider>
  );
}