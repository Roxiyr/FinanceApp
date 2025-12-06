import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import { TransactionProvider } from './context/TransactionContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './Page/Dashboard/Dashboard';
import Pendapatan from './Page/Pendapatan/Pendapatan';
import Pengeluaran from './Page/Pengeluaran/Pengeluaran';
import Laporan from './Page/Laporan/Laporan';
import Anggaran from './Page/Anggaran/Anggaran';
import LoginPage from './Page/Login/LoginPage';

function AppContent() {
  const { user, logout } = useContext(AuthContext);
  const initialPage = (typeof window !== 'undefined' && window.location.hash) 
    ? window.location.hash.replace('#','') 
    : 'dashboard';

  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = currentPage;
    }
  }, [currentPage]);

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
    console.log('Logout clicked');
    logout();
    setCurrentPage('dashboard');
  }

  function renderPage() {
    // Jika belum login, tampil login page
    if (!user) {
      return <LoginPage />;
    }

    // Jika sudah login, tampil halaman sesuai currentPage
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
    <>
      {user && (
        <Navbar 
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
          onLogout={handleLogout}
        />
      )}
      {renderPage()}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <AppContent />
      </TransactionProvider>
    </AuthProvider>
  );
}
