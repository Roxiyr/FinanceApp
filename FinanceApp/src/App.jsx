import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { TransactionProvider } from "./context/TransactionContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
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
