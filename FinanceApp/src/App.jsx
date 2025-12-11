import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { TransactionProvider } from "./context/TransactionContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/footer/footer";
import Dashboard from "./Page/Dashboard/Dashboard";
import Pendapatan from "./Page/Pendapatan/Pendapatan";
import Pengeluaran from "./Page/Pengeluaran/Pengeluaran";
import Laporan from "./Page/Laporan/Laporan";
import Anggaran from "./Page/Anggaran/Anggaran";
import LoginPage from "./Page/Login/LoginPage";

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  if (isLoading) return null; // atau spinner
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <AppRoutes />
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <>
      <HealthBanner />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ProtectedApp />
            </RequireAuth>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

function ProtectedApp() {
  // Navbar akan tampil setelah login
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pendapatan" element={<Pendapatan />} />
        <Route path="/pengeluaran" element={<Pengeluaran />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/anggaran" element={<Anggaran />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function HealthBanner() {
  const [status, setStatus] = React.useState('checking');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('http://localhost:4001/api/health');
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok) {
          setStatus('ok');
          setMessage(data?.message || 'Backend online');
        } else {
          setStatus('error');
          setMessage(data?.error || res.statusText);
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err.message || 'Tidak bisa terhubung ke backend');
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (status === 'ok') return null;
  return (
    <div className="health-banner">
      <span className="health-dot" />
      <span>{message || 'Backend tidak dapat dihubungi'}</span>
    </div>
  );
}
