import React from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

export default function App() {
  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-content">
          <div className="navbar-section">
            <div className="logo-container">
              <div className="logo-icon" aria-hidden>
                {/* simple SVG mark */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#fff" />
                  <path d="M6 12h12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="logo-text">FinanceApp</div>
            </div>

            <nav className="nav-menu" aria-label="Main navigation">
              <button className="nav-item nav-item-active">Dashboard</button>
              <button className="nav-item">Pendapatan</button>
              <button className="nav-item">Pengeluaran</button>
              <button className="nav-item">Anggaran</button>
              <button className="nav-item">Laporan</button>
            </nav>

            <div className="action-buttons">
              <button className="btn btn-success">+ Pendapatan</button>
              <button className="btn btn-danger">+ Pengeluaran</button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan keuangan Anda</p>
        </header>

        <section className="empty-state" role="region" aria-label="Empty state">
          <div className="empty-icon-wrapper">
            <div className="empty-icon-container">
              {/* wallet-like icon */}
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" width="64" height="64" aria-hidden>
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="#93c5fd" strokeWidth="1.5" />
                <circle cx="17" cy="12" r="1.6" fill="#93c5fd" />
              </svg>

              <div className="empty-icon-badge" aria-hidden style={{background:'#22c55e', borderRadius:999, padding:6, position:'absolute', right:-6, bottom:-6}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <h2 className="empty-title" style={{marginBottom:8}}>Belum Ada Transaksi</h2>
          <p className="empty-description" style={{maxWidth:420, textAlign:'center', color:'#6b7280', marginBottom:24}}>
            Mulai kelola keuangan Anda dengan menambahkan transaksi pertama. Catat pendapatan dan pengeluaran untuk melihat ringkasan keuangan Anda.
          </p>

          <div className="empty-actions" style={{display:'flex', gap:16}}>
            <button className="btn btn-success btn-lg">+ Tambah Pendapatan</button>
            <button className="btn btn-danger btn-lg">+ Tambah Pengeluaran</button>
          </div>

          <a className="link-button" style={{marginTop:16, display:'block', color:'#3b82f6'}}>Atau lihat contoh data</a>
        </section>
      </main>
    </div>
  );
}
