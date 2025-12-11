const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password diperlukan' });
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0184059c-dd5d-4018-a26c-8ffaf95c6525', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H1',
          location: 'authController.js:login:entry',
          message: 'Login request received',
          data: {
            email,
            origin: req.headers?.origin || null,
            nodeEnv: process.env.NODE_ENV || 'undefined'
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('⚠️ [WARNING] JWT_SECRET tidak ditemukan di environment variables');
        return res.status(500).json({ error: 'Konfigurasi server tidak valid' });
      }

      // Cari user di database
      const user = await User.findByEmail(email);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0184059c-dd5d-4018-a26c-8ffaf95c6525', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H2',
          location: 'authController.js:login:afterFind',
          message: 'User lookup result',
          data: {
            emailFound: !!user,
            dbHost: process.env.DB_HOST || 'localhost'
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion
      
      if (user) {
        // Jika user ada, verifikasi password
        if (!user.password) {
          // User ada tapi belum punya password (migrasi data lama)
          return res.status(400).json({ error: 'Akun belum terdaftar dengan benar' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Email atau password salah' });
        }
      } else {
        // Demo mode: buat user baru jika tidak ada (untuk development)
        // Di production, hapus bagian ini dan hanya return error
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({ error: 'Email atau password salah' });
        }
        
        // Development mode: auto-create user dengan password yang di-hash
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = await User.create(email, email.split('@')[0], passwordHash);
        
        const newUser = await User.findById(userId);
        const token = jwt.sign(
          { id: newUser.id, email: newUser.email },
          jwtSecret,
          { expiresIn: '7d' }
        );

        return res.json({ 
          status: 'ok', 
          user: { id: newUser.id, email: newUser.email, name: newUser.name },
          token 
        });
      }

      // User ditemukan dan password valid
      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({ 
        status: 'ok', 
        user: { id: user.id, email: user.email, name: user.name },
        token 
      });
    } catch (err) {
      console.error('Login error:', err);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0184059c-dd5d-4018-a26c-8ffaf95c6525', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H3',
          location: 'authController.js:login:error',
          message: 'Login error caught',
          data: {
            errorMessage: err.message,
            errorName: err.name
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion

      res.status(500).json({ error: err.message });
    }
  }

  static async logout(req, res) {
    res.json({ status: 'ok', message: 'Logout berhasil' });
  }
}

module.exports = AuthController;