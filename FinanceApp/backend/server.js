require('dotenv').config();
const app = require('./src/app');

const port = process.env.PORT || 4001;

app.listen(port, () => {
  console.log('\n[SERVER] Backend berjalan di http://localhost:' + port);
  console.log('[SERVER] Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('[DATABASE] Host: ' + (process.env.DB_HOST || 'localhost'));
  console.log('[API] Health check: GET http://localhost:' + port + '/api/health');
  console.log('');

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0184059c-dd5d-4018-a26c-8ffaf95c6525', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'run3',
      hypothesisId: 'H5',
      location: 'server.js:listen',
      message: 'Backend server started',
      data: {
        port,
        nodeEnv: process.env.NODE_ENV || 'undefined',
        dbHost: process.env.DB_HOST || 'localhost'
      },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion
});
