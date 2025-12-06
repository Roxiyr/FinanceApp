import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user dari localStorage saat mount
  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('fa_user'));
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (e) {
      console.error('Failed to load user', e);
    }
    setIsLoading(false);
  }, []);

  // Save user ke localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('fa_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fa_user');
    }
  }, [user]);

  function login(email, password) {
    // Validasi input
    if (!email || !password) {
      throw new Error('Email dan password harus diisi');
    }

    // Simulasi login (ganti dengan API real nanti)
    const newUser = {
      id: crypto.randomUUID(),
      email: email,
      name: email.split('@')[0], // ambil nama dari email
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    return newUser;
  }

  function logout() {
    setUser(null);
  }

  function updateProfile(updates) {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return updatedUser;
    }
  }

  function isAuthenticated() {
    return !!user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateProfile,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}