require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { migrate, seed } = require('./db/migrate');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';// 确保健康检查路由最先处理
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// ── Security headers ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // managed by frontend CDN
}));

// ── Compression ───────────────────────────────────────────────
app.use(compression());

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use('/api/', rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Stripe webhook MUST receive raw body ─────────────────────
const paymentsRouter = require('./routes/payments');
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));

// ── JSON body parser (skip webhook path) ─────────────────────
app.use((req, res, next) => {
  if (req.path === '/api/payments/webhook') return next();
  express.json({ limit: '1mb' })(req, res, next);
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/episodes', require('./routes/episodes'));
app.use('/api/payments', paymentsRouter);

// ── Serve frontend static build in production ─────────────────
if (IS_PROD) {
  const distPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(distPath, { maxAge: '7d', etag: true }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV || 'development',
  stripe: !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('REPLACE')),
  db: !(process.env.DATABASE_URL || '').includes('REPLACE') && !!process.env.DATABASE_URL,
  time: new Date().toISOString(),
}));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  if (IS_PROD) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// ── Startup ───────────────────────────────────────────────────
async function start() {
  try {
    await migrate();
    await seed();
  } catch (err) {
    console.error('⚠️  DB init warning:', err.message);
    if (IS_PROD) {
      console.error('FATAL: production requires a working database. Check DATABASE_URL.');
      process.exit(1);
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server [${process.env.NODE_ENV || 'development'}] → http://0.0.0.0:${PORT}`);
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
      console.warn('   ⚠️  STRIPE_SECRET_KEY not set — payment endpoints disabled');
    }
  });
}

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
process.on('uncaughtException', (err) => { console.error('Uncaught exception:', err); process.exit(1); });

start();
