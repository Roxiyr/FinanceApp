import React, { useState, useEffect } from 'react';
import './App.css';
import { TransactionProvider } from './context/TransactionContext';
import Navbar from './components/Navbar';
import Dashboard from './Page/Dashboard/Dashboard';
import Pendapatan from './Page/Pendapatan/Pendapatan';
import Pengeluaran from './Page/Pengeluaran/Pengeluaran';
import Laporan from './Page/Laporan/Laporan';
import Anggaran from './Page/Anggaran/Anggaran';

export default function App() {
  // ambil initial page dari hash (jika ada) supaya tampilan sesuai "tampilan awalnya"
  const initialPage = (typeof window !== 'undefined' && window.location.hash) 
    ? window.location.hash.replace('#','') 
    : 'dashboard';

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // ketika currentPage berubah, update URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = currentPage;
    }
  }, [currentPage]);

  // listen perubahan hash dari luar (back/forward atau link)
  useEffect(() => {
    function onHashChange() {
      const page = window.location.hash.replace('#','') || 'dashboard';
      setCurrentPage(page);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleNavigate(pageId) {
    console.log('App received navigation to:', pageId);
    setCurrentPage(pageId);
    window.scrollTo(0,0);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  }

  function renderPage() {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'pendapatan': return <Pendapatan />;
      case 'pengeluaran': return <Pengeluaran />;
      case 'laporan': return <Laporan />;
      case 'anggaran': return <Anggaran />;
      default: return <Dashboard />;
    }
  }

  return (
    <TransactionProvider>
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      {renderPage()}
    </TransactionProvider>
  );
}
