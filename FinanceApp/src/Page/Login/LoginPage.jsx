import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      console.log('Login successful:', data.token);

      // Simpan token di localStorage
      localStorage.setItem('token', data.token);

      // Redirect ke halaman Dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    console.log('Navigating to dashboard...');
    navigate('/dashboard');
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="12" rx="2" fill="#3b82f6" />
              <circle cx="17" cy="12" r="1.6" fill="#fff" />
            </svg>
          </div>
          <h1 className="login-title">FinanceApp</h1>
          <p className="login-subtitle">Kelola keuangan Anda dengan mudah</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" width={20} height={20} />
              <input
                type="email"
                name="email"
                placeholder="nama@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" width={20} height={20} />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Loading...' : (
              <>
                <LogIn width={20} height={20} />
                Masuk
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo: Gunakan email & password apapun untuk masuk</p>
        </div>
      </div>
    </div>
  );
}