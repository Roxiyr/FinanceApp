const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// #region agent log
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth/login')) {
    fetch('http://127.0.0.1:7242/ingest/0184059c-dd5d-4018-a26c-8ffaf95c6525', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run3',
        hypothesisId: 'H6',
        location: 'app.js:middleware:login',
        message: 'Incoming login request',
        data: {
          method: req.method,
          path: req.path,
          origin: req.headers?.origin || null
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
  }
  next();
});
// #endregion

app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ [ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;