import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const { user, logout } = useContext(AuthContext);

  const API_BASE = 'http://localhost:4001/api';

  async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('fa_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (res.status === 401 || res.status === 403) {
      await logout?.();
      throw new Error(data?.error || 'Unauthorized');
    }
    if (!res.ok) {
      throw new Error(data?.error || 'Request gagal');
    }
    return data;
  }

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

  // fetch from backend when user/token tersedia
  useEffect(() => {
    const token = localStorage.getItem('fa_token');
    if (!user || !token) {
      setTransactions([]);
      setBudgets([]);
      return;
    }

    const load = async () => {
      try {
        const [txRes, bRes] = await Promise.all([
          apiFetch('/transactions', { method: 'GET' }),
          apiFetch('/budgets', { method: 'GET' })
        ]);
        if (txRes?.data) setTransactions(txRes.data);
        if (bRes?.data) setBudgets(bRes.data);
      } catch (err) {
        console.error('Fetch data gagal:', err.message);
      }
    };
    load();
  }, [user]);

  // persist transactions
  useEffect(() => {
    localStorage.setItem('fa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // persist budgets
  useEffect(() => {
    localStorage.setItem('fa_budgets', JSON.stringify(budgets));
  }, [budgets]);

  async function addTransaction(newTx) {
    const payload = { ...newTx };
    const data = await apiFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const created = { ...payload, id: data.id || payload.id };
    setTransactions((prev) => [...prev, created]);
  }

  async function updateTransaction(id, updates) {
    await apiFetch(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    setTransactions((prev) => 
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  }

  async function deleteTransaction(id) {
    await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
    setTransactions((prev) => prev.filter(tx => tx.id !== id));
  }

  async function addBudget(budget) {
    const data = await apiFetch('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget)
    });
    const created = { ...budget, id: data.id || budget.id };
    setBudgets((prev) => [...prev, created]);
  }

  async function updateBudget(id, patch) {
    await apiFetch(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch)
    });
    setBudgets((prev) => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }

  async function deleteBudget(id) {
    await apiFetch(`/budgets/${id}`, { method: 'DELETE' });
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