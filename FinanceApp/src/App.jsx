import React from 'react';
import './App.css';
import { TransactionProvider } from './context/TransactionContext';
import Dashboard from './Page/Dashboard/Dashboard';

export default function App() {
  return (
    <TransactionProvider>
      <Dashboard />
    </TransactionProvider>
  );
}
