import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     LOAD USER SAAT APP DIBUKA
  ========================= */
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("fa_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("AuthContext: failed to load user", e);
      localStorage.removeItem("fa_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* =========================
     LOGIN
  ========================= */
  async function login(email, password) {
    const res = await fetch("http://localhost:4001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login gagal");

    localStorage.setItem("fa_token", data.token);
    localStorage.setItem("fa_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  /* =========================
     LOGOUT (AMAN)
  ========================= */
  function logout() {
    localStorage.removeItem("fa_user");
    localStorage.removeItem("fa_token");
    setUser(null);

    // ❗ JANGAN sentuh fa_transactions
    // ❗ JANGAN pakai localStorage.clear()
  }

  function isAuthenticated() {
    return !!user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
