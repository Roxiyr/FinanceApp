import { createContext, useState, useEffect } from "react";
import { useBudget } from "./BudgetContext";

export const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  // budgets come from BudgetContext
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();

  // load transactions from localStorage once
  useEffect(() => {
    try {
      const t = JSON.parse(localStorage.getItem('fa_transactions') || '[]');
      setTransactions(t);
    } catch (e) {
      console.error('TransactionProvider: Failed to parse storage', e);
    }
  }, []);

  // persist transactions
  useEffect(() => {
    try {
      localStorage.setItem('fa_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error('TransactionProvider: Failed to persist transactions', e);
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