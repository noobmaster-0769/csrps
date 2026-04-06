const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/students',  require('./routes/students'));
app.use('/api/subjects',  require('./routes/subjects'));
app.use('/api/marks',     require('./routes/marks'));
app.use('/api/results',   require('./routes/results'));
app.use('/api/analytics', require('./routes/analytics'));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    system:  'CSRPS — Cloud Student Result Processing System',
    status:  'running',
    version: '1.0.0',
    daas_endpoints: [
      'GET  /api/students',
      'GET  /api/results/:id',
      'GET  /api/analytics',
      'POST /api/marks'
    ]
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CSRPS Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DaaS APIs   : http://localhost:${PORT}/api/*\n`);

  // ── Keep-alive ping (prevents Railway free tier cold starts) ───────────────
  if (process.env.NODE_ENV === 'production') {
    const BACKEND_URL = `https://csrps-production.up.railway.app`;
    setInterval(() => {
      fetch(BACKEND_URL)
        .then(() => console.log('🏓 Keep-alive ping sent'))
        .catch(() => {});
    }, 14 * 60 * 1000); // every 14 minutes
    console.log('   Keep-alive : enabled (pings every 14 min)\n');
  }
});