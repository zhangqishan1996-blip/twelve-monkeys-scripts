const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + process.env.JWT_SECRET).digest('hex');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const hash = hashPassword(password);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, coins_balance) VALUES ($1,$2,$3) RETURNING id, email, coins_balance',
      [email.toLowerCase(), hash, 100]
    );
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const hash = hashPassword(password);
    const { rows } = await pool.query(
      'SELECT id, email, coins_balance FROM users WHERE email=$1 AND password_hash=$2',
      [email.toLowerCase(), hash]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
