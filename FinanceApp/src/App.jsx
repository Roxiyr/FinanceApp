import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { TransactionProvider } from "./context/TransactionContext";

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
  if (isLoading) return null;
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/pendapatan" element={<Pendapatan />} />
                      <Route path="/pengeluaran" element={<Pengeluaran />} />
                      <Route path="/laporan" element={<Laporan />} />
                      <Route path="/anggaran" element={<Anggaran />} />
                    </Routes>
                    <Footer />
                  </>
                </RequireAuth>
              }
            />
          </Routes>
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}
