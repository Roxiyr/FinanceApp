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
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      // Login melalui AuthContext (akan menyimpan token dan user)
      await login(formData.email, formData.password);
      
      // Redirect ke halaman Dashboard
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0184059c-dd5d-4018-a26c-8ffaf95c6525', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H4',
          location: 'LoginPage.jsx:handleSubmit:catch',
          message: 'Login fetch failed on client',
          data: {
            errorMessage: err?.message || null,
            url: window.location?.href || null,
            backendUrl: 'http://localhost:4000/api/auth/login'
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion

      setError(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
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
          <p>Demo: Gunakan email & password apapun untuk masuk (development mode)</p>
        </div>
      </div>
    </div>
  );
}