require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// ── Stripe: graceful init ─────────────────────────────────────
// Set STRIPE_MODE=live to use live keys, anything else = test keys
// Set STRIPE_SECRET_KEY=sk_test_xxx or sk_live_xxx accordingly
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeReady = !!(stripeKey && !stripeKey.includes('REPLACE') && stripeKey.startsWith('sk_'));
const stripe = stripeReady ? require('stripe')(stripeKey) : null;

if (!stripeReady) {
  console.warn('  ⚠️  STRIPE_SECRET_KEY missing or placeholder — payment routes will return 503');
} else {
  const mode = stripeKey.startsWith('sk_live_') ? 'LIVE 🔴' : 'TEST 🟡';
  console.log(`  💳 Stripe initialized in ${mode} mode`);
}

const router = express.Router();

// ── Coin / deposit packages ───────────────────────────────────
// Add CNY-denominated deposit packages for the script marketplace
const COIN_PACKAGES = [
  { id: 'coins_1000',    coins: 1000,  price: 999,   currency: 'usd', label: '$9.99 — 1,000 Coins' },
  { id: 'coins_3000',    coins: 3000,  price: 2499,  currency: 'usd', label: '$24.99 — 3,000 Coins' },
  { id: 'coins_6000',    coins: 6000,  price: 3999,  currency: 'usd', label: '$39.99 — 6,000 Coins' },
];

const DEPOSIT_PACKAGES = [
  { id: 'deposit_1000',  coins: 0,     price: 100000, currency: 'cny', label: '¥1,000 版权定金', isDeposit: true },
  { id: 'deposit_5000',  coins: 0,     price: 500000, currency: 'cny', label: '¥5,000 版权定金', isDeposit: true },
  { id: 'deposit_10000', coins: 0,     price: 1000000,currency: 'cny', label: '¥10,000 版权定金', isDeposit: true },
];

const ALL_PACKAGES = [...COIN_PACKAGES, ...DEPOSIT_PACKAGES];

// ── Routes ────────────────────────────────────────────────────

// GET /api/payments/packages
router.get('/packages', (req, res) => {
  res.json({
    coins: COIN_PACKAGES,
    deposits: DEPOSIT_PACKAGES,
    stripeAvailable: stripeReady,
    mode: stripeReady ? (stripeKey.startsWith('sk_live_') ? 'live' : 'test') : 'disabled',
  });
});

// POST /api/payments/checkout
router.post('/checkout', authMiddleware, async (req, res) => {
  if (!stripeReady) {
    return res.status(503).json({
      error: 'Payment system offline',
      hint: 'Set STRIPE_SECRET_KEY in server/.env — use sk_test_xxx for testing or sk_live_xxx for production.',
    });
  }

  const { packageId } = req.body;
  const pkg = ALL_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return res.status(400).json({ error: 'Invalid package ID' });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    const productName = pkg.isDeposit
      ? `十二猴子剧本 · 版权意向定金 ${pkg.label}`
      : `${pkg.coins.toLocaleString()} Coins — 十二猴子剧本`;

    const productDesc = pkg.isDeposit
      ? '版权洽谈定金，正式签约后可全额抵扣版权费用，不签约全额退还'
      : '短剧平台金币充值，用于解锁剧本内容';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: pkg.currency,
          unit_amount: pkg.price,
          product_data: { name: productName, description: productDesc },
        },
        quantity: 1,
      }],
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
      metadata: {
        userId: String(req.user.id),
        coins: String(pkg.coins),
        packageId: pkg.id,
        isDeposit: String(!!pkg.isDeposit),
      },
    });

    await pool.query(
      'INSERT INTO stripe_sessions (user_id, session_id, coins, status) VALUES ($1,$2,$3,$4)',
      [req.user.id, session.id, pkg.coins, 'pending']
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: 'Payment session creation failed', detail: err.message });
  }
});

// POST /api/payments/webhook — Stripe webhook (raw body pre-applied by main app)
router.post('/webhook', async (req, res) => {
  if (!stripeReady) return res.status(503).send('Stripe not configured');

  const sig = req.headers['stripe-signature'];
  if (!stripeWebhookSecret || stripeWebhookSecret.includes('REPLACE')) {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev only)');
    return res.json({ received: true, warn: 'Signature not verified' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata.userId);
    const coins = parseInt(session.metadata.coins);
    const isDeposit = session.metadata.isDeposit === 'true';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        'UPDATE stripe_sessions SET status=$1 WHERE session_id=$2 AND status=$3 RETURNING id',
        ['completed', session.id, 'pending']
      );

      if (rows.length > 0) {
        if (coins > 0 && !isDeposit) {
          await client.query(
            'UPDATE users SET coins_balance = coins_balance + $1 WHERE id=$2',
            [coins, userId]
          );
          console.log(`✅ Credited ${coins} coins to user ${userId}`);
        } else if (isDeposit) {
          console.log(`✅ Deposit payment confirmed for user ${userId}, amount: ${session.amount_total / 100} ${session.currency.toUpperCase()}`);
          // Deposit logic: notify admin, create deposit record, etc.
          // For now we log it — in production, send email/webhook to business team
        }
      } else {
        console.warn(`⚠️  Duplicate webhook for session ${session.id} — skipped`);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Webhook processing error:', err.message);
      return res.status(500).json({ error: 'Webhook processing failed' });
    } finally {
      client.release();
    }
  }

  res.json({ received: true });
});

// GET /api/payments/balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT coins_balance FROM users WHERE id=$1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ coins_balance: rows[0].coins_balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;
