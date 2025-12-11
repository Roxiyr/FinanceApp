const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Default Route (Perbaikan dari error "Cannot GET /")
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running..." });
});

// Register API
app.post('/api/register', async (req, res) => {
  console.log('Request body:', req.body); 

  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(query, [email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error registering user' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Email:', email); // Log email yang diterima
  console.log('Password:', password); // Log password yang diterima

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      console.log('User not found:', email);
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
    console.log('Generated token:', token);
    res.json({ token });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
