import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation ditambahkan
import { AuthContext } from '../context/AuthContext';
import { Menu, X, LogOut, BarChart3, TrendingUp, TrendingDown, Home, Target } from 'lucide-react';
import './Navbar.css';

// Hapus prop 'currentPage'
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Mendapatkan objek lokasi (berisi pathname)
  const { logout, isAuthenticated } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    // Tambahkan properti 'path' yang sesuai
    { id: 'dashboard', label: 'Dashboard', path: '/', icon: Home },
    { id: 'pendapatan', label: 'Pendapatan', path: '/pendapatan', icon: TrendingUp },
    { id: 'pengeluaran', label: 'Pengeluaran', path: '/pengeluaran', icon: TrendingDown },
    { id: 'anggaran', label: 'Anggaran', path: '/anggaran', icon: Target },
    { id: 'laporan', label: 'Laporan', path: '/laporan', icon: BarChart3 },
  ];

  // RouteMap digunakan untuk fungsi handleNavClick (navigate)
  const routeMap = {
    dashboard: '/',
    pendapatan: '/pendapatan',
    pengeluaran: '/pengeluaran',
    anggaran: '/anggaran',
    laporan: '/laporan',
    login: '/login'
  };

  function handleNavClick(pageId) {
    const target = routeMap[pageId] || '/';
    navigate(target);
    setMobileMenuOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setMobileMenuOpen(false);
  }
  
  // Fungsi pembantu untuk menentukan apakah item menu saat ini aktif
  const isActive = (path) => {
      // Menggunakan kecocokan persis antara URL saat ini dengan path item menu
      return location.pathname === path;
  };

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
            const isItemActive = isActive(item.path); // KUNCI PERBAIKAN: Cek status aktif

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                // Terapkan kelas aktif berdasarkan URL
                className={`nav-item ${isItemActive ? 'nav-item-active' : ''}`}
                aria-current={isItemActive ? 'page' : undefined}
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
          {isAuthenticated() && (
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
          {!isAuthenticated() && (
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
              const isItemActive = isActive(item.path); // KUNCI PERBAIKAN: Cek status aktif

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  // Terapkan kelas aktif berdasarkan URL
                  className={`mobile-nav-item ${isItemActive ? 'mobile-nav-item-active' : ''}`}
                  type="button"
                >
                  <Icon width={20} height={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="mobile-actions">
            {isAuthenticated() && (
              <button 
                onClick={handleLogout}
                className="btn btn-logout btn-block"
                type="button"
              >
                <LogOut width={16} height={16} />
                <span>Keluar</span>
              </button>
            )}
            {!isAuthenticated() && ( 
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
