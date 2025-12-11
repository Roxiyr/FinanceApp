import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user dari localStorage saat mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('fa_user') || 'null');
        const token = localStorage.getItem('fa_token');
        
        if (savedUser && token) {
          // Verifikasi token masih valid dengan backend
          try {
            const response = await fetch('http://localhost:4000/api/transactions/stats', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              setUser(savedUser);
            } else if (response.status === 401 || response.status === 403) {
              // Token tidak valid, hapus data
              localStorage.removeItem('fa_user');
              localStorage.removeItem('fa_token');
            } else {
              // Backend error lainnya, tetap gunakan data lokal
              setUser(savedUser);
            }
          } catch (e) {
            // Backend tidak tersedia, gunakan data lokal
            setUser(savedUser);
          }
        }
      } catch (e) {
        console.error('Failed to load user', e);
        localStorage.removeItem('fa_user');
        localStorage.removeItem('fa_token');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Save user ke localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('fa_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fa_user');
    }
  }, [user]);

  async function login(email, password) {
    // Validasi input
    if (!email || !password) {
      throw new Error('Email dan password harus diisi');
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      // Simpan token
      if (data.token) {
        localStorage.setItem('fa_token', data.token);
      }

      // Set user dari response
      if (data.user) {
        setUser(data.user);
        return data.user;
      }

      throw new Error('Data user tidak ditemukan');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  }

  async function logout() {
    try {
      const token = localStorage.getItem('fa_token');
      if (token) {
        // Panggil API logout (opsional)
        try {
          await fetch('http://localhost:4000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (e) {
          // Ignore error jika backend tidak tersedia
          console.warn('Logout API call failed:', e);
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Hapus data lokal
      setUser(null);
      localStorage.removeItem('fa_token');
      localStorage.removeItem('fa_user');
    }
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