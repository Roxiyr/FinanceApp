require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 4001;

/* ========================
   MIDDLEWARE
======================== */
app.use(cors());
app.use(bodyParser.json());

/* ========================
   HEALTH CHECK
======================== */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend API is running'
  });
});

/* ========================
   AUTH REGISTER
======================== */
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';

    db.query(sql, [email, hashedPassword], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Gagal register' });
      }
      res.json({ message: 'Register berhasil' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ========================
   AUTH LOGIN
======================== */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'Email tidak ditemukan' });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  });
});

/* ========================
   START SERVER
======================== */
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
