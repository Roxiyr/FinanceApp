import React, { createContext, useContext, useEffect, useState } from 'react';

export const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fa_budgets') || '[]';
      setBudgets(JSON.parse(raw));
    } catch (e) {
      console.error('BudgetProvider: failed to load budgets', e);
      setBudgets([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('fa_budgets', JSON.stringify(budgets));
    } catch (e) {
      console.error('BudgetProvider: failed to persist budgets', e);
    }
  }, [budgets]);

  function addBudget(budget) {
    setBudgets((prev) => [...prev, budget]);
  }

  function updateBudget(id, patch) {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function deleteBudget(id) {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  function getBudgetById(id) {
    return budgets.find((b) => b.id === id);
  }

  const value = {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetById,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  return useContext(BudgetContext);
}
