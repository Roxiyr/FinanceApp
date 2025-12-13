import { createContext, useState, useEffect } from "react";
import { useBudget } from "./BudgetContext";

export const TransactionContext = createContext();

export function TransactionProvider({ children }) {

  /* =========================
     LOAD LANGSUNG DARI LOCALSTORAGE
  ========================= */
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("fa_transactions");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("TransactionProvider: parse error", e);
      return [];
    }
  });

  // budgets from BudgetContext
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();

  /* =========================
     SIMPAN SETIAP PERUBAHAN
  ========================= */
  useEffect(() => {
    try {
      localStorage.setItem(
        "fa_transactions",
        JSON.stringify(transactions)
      );
    } catch (e) {
      console.error("TransactionProvider: persist error", e);
    }
  }, [transactions]);

  /* =========================
     CRUD TRANSACTION
  ========================= */
  function addTransaction(newTx) {
    setTransactions(prev => [
      ...prev,
      {
        id: Date.now(),   // pastikan ID selalu ada
        ...newTx
      }
    ]);
  }

  function updateTransaction(id, updates) {
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  }

  function deleteTransaction(id) {
    setTransactions(prev =>
      prev.filter(tx => tx.id !== id)
    );
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,

        // expose budget API
        budgets,
        addBudget,
        updateBudget,
        deleteBudget
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
