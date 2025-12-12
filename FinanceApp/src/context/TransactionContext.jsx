import { createContext, useState, useEffect } from "react";

export const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // load from localStorage once
  useEffect(() => {
    try {
      const t = JSON.parse(localStorage.getItem('fa_transactions') || '[]');
      const b = JSON.parse(localStorage.getItem('fa_budgets') || '[]');
      setTransactions(t);
      setBudgets(b);
    } catch (e) {
      console.error('Failed to parse storage', e);
    }
  }, []);

  // persist transactions
  useEffect(() => {
    localStorage.setItem('fa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // persist budgets
  useEffect(() => {
    localStorage.setItem('fa_budgets', JSON.stringify(budgets));
  }, [budgets]);

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

  function addBudget(budget) {
    setBudgets((prev) => [...prev, budget]);
  }

  function updateBudget(id, patch) {
    setBudgets((prev) => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }

  function deleteBudget(id) {
    setBudgets((prev) => prev.filter(b => b.id !== id));
  }

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      budgets,
      addBudget,
      updateBudget,
      deleteBudget
    }}>
      {children}
    </TransactionContext.Provider>
  );
}