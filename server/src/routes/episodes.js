const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/episodes — list all, with unlock status if authed
router.get('/', async (req, res) => {
  try {
    let userId = null;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {}
    }

    let query;
    let params;

    if (userId) {
      query = `
        SELECT e.*,
               (uc.user_id IS NOT NULL) AS is_unlocked
        FROM episodes e
        LEFT JOIN unlocked_contents uc ON uc.video_id = e.id AND uc.user_id = $1
        ORDER BY e.episode_num ASC
      `;
      params = [userId];
    } else {
      query = `SELECT *, false AS is_unlocked FROM episodes ORDER BY episode_num ASC`;
      params = [];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

// POST /api/episodes/:id/unlock — spend coins
router.post('/:id/unlock', authMiddleware, async (req, res) => {
  const episodeId = parseInt(req.params.id);
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: epRows } = await client.query('SELECT * FROM episodes WHERE id=$1', [episodeId]);
    if (!epRows.length) return res.status(404).json({ error: 'Episode not found' });
    const episode = epRows[0];

    if (episode.is_free) {
      await client.query('ROLLBACK');
      return res.json({ success: true, message: 'Episode is free' });
    }

    const { rows: existRows } = await client.query(
      'SELECT id FROM unlocked_contents WHERE user_id=$1 AND video_id=$2',
      [userId, episodeId]
    );
    if (existRows.length) {
      await client.query('ROLLBACK');
      return res.json({ success: true, message: 'Already unlocked' });
    }

    const { rows: userRows } = await client.query(
      'SELECT coins_balance FROM users WHERE id=$1 FOR UPDATE',
      [userId]
    );
    const user = userRows[0];

    if (user.coins_balance < episode.coin_cost) {
      await client.query('ROLLBACK');
      return res.status(402).json({ error: 'Insufficient coins', balance: user.coins_balance, required: episode.coin_cost });
    }

    await client.query('UPDATE users SET coins_balance = coins_balance - $1 WHERE id=$2', [episode.coin_cost, userId]);
    await client.query('INSERT INTO unlocked_contents (user_id, video_id) VALUES ($1,$2)', [userId, episodeId]);

    const { rows: updatedUser } = await client.query('SELECT coins_balance FROM users WHERE id=$1', [userId]);

    await client.query('COMMIT');
    res.json({ success: true, coins_balance: updatedUser[0].coins_balance });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Unlock failed' });
  } finally {
    client.release();
  }
});

// POST /api/episodes/:id/unlock-ad — free unlock via ad watch
router.post('/:id/unlock-ad', authMiddleware, async (req, res) => {
  const episodeId = parseInt(req.params.id);
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: epRows } = await client.query('SELECT id FROM episodes WHERE id=$1', [episodeId]);
    if (!epRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Episode not found' });
    }

    await client.query(
      'INSERT INTO unlocked_contents (user_id, video_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [userId, episodeId]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Ad unlock failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
