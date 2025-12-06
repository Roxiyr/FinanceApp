import { useState } from 'react';
import { Menu, X, LogOut, BarChart3, TrendingUp, TrendingDown, Home } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ 
  currentPage = 'dashboard', 
  onNavigate = () => {}, 
  isLoggedIn = true, 
  onLogout = () => {} 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pendapatan', label: 'Pendapatan', icon: TrendingUp },
    { id: 'pengeluaran', label: 'Pengeluaran', icon: TrendingDown },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  ];

  function handleNavClick(pageId) {
    console.log('Navigating to:', pageId);
    onNavigate(pageId);
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    console.log('Logout clicked');
    onLogout();
    setMobileMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="navbar-content">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#fff" />
              <path d="M6 12h12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="logo-text">FinanceApp</div>
        </div>

        {/* Desktop Nav Menu */}
        <nav className="nav-menu" aria-label="Main navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${currentPage === item.id ? 'nav-item-active' : ''}`}
                aria-current={currentPage === item.id ? 'page' : undefined}
                type="button"
              >
                <Icon width={18} height={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="btn btn-logout"
              aria-label="Logout"
              type="button"
            >
              <LogOut width={16} height={16} />
              <span>Keluar</span>
            </button>
          )}
          {!isLoggedIn && (
            <button 
              onClick={() => handleNavClick('login')}
              className="btn btn-login"
              aria-label="Login"
              type="button"
            >
              <span>Masuk</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          type="button"
        >
          {mobileMenuOpen ? (
            <X width={24} height={24} />
          ) : (
            <Menu width={24} height={24} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`mobile-nav-item ${currentPage === item.id ? 'mobile-nav-item-active' : ''}`}
                  type="button"
                >
                  <Icon width={20} height={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="mobile-actions">
            {isLoggedIn && (
              <button 
                onClick={handleLogout}
                className="btn btn-logout btn-block"
                type="button"
              >
                <LogOut width={16} height={16} />
                <span>Keluar</span>
              </button>
            )}
            {!isLoggedIn && (
              <button 
                onClick={() => handleNavClick('login')}
                className="btn btn-login btn-block"
                type="button"
              >
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}