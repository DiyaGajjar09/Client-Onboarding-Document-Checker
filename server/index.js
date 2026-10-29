const express = require('express');
const cors    = require('cors');

const analyzeRoutes   = require('./routes/analyze');
const templatesRoutes = require('./routes/templates');
const followupRoutes  = require('./routes/followup');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ──
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ──
app.use('/api/analyze',   analyzeRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/followup',  followupRoutes);

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 OnboardIQ API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
