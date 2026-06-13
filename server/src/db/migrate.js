require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const isMock = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('REPLACE');
const pool = require('./index');

async function migrate() {
  if (isMock) { console.log('⏩ Mock DB — skipping migration'); return; }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        coins_balance INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS episodes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        episode_num INTEGER NOT NULL,
        is_free BOOLEAN NOT NULL DEFAULT false,
        coin_cost INTEGER NOT NULL DEFAULT 10,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS unlocked_contents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, video_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS stripe_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        coins INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration complete');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function seed() {
  if (isMock) { console.log('⏩ Mock DB — skipping seed'); return; }
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT COUNT(*) FROM episodes');
    if (parseInt(rows[0].count) > 0) {
      console.log('⏩ Episodes already seeded, skipping');
      return;
    }

    const episodes = [
      { title: 'The Billionaire\'s Secret', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnail_url: 'https://picsum.photos/seed/ep1/400/700', episode_num: 1, is_free: true, coin_cost: 0 },
      { title: 'Love at First Sight', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnail_url: 'https://picsum.photos/seed/ep2/400/700', episode_num: 2, is_free: true, coin_cost: 0 },
      { title: 'Hidden Heir Returns', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnail_url: 'https://picsum.photos/seed/ep3/400/700', episode_num: 3, is_free: false, coin_cost: 10 },
      { title: 'CEO\'s Forbidden Love', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnail_url: 'https://picsum.photos/seed/ep4/400/700', episode_num: 4, is_free: false, coin_cost: 10 },
      { title: 'Revenge of the Scorned', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnail_url: 'https://picsum.photos/seed/ep5/400/700', episode_num: 5, is_free: false, coin_cost: 10 },
      { title: 'The Mysterious Stranger', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumbnail_url: 'https://picsum.photos/seed/ep6/400/700', episode_num: 6, is_free: false, coin_cost: 10 },
      { title: 'Destined to Be Together', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', thumbnail_url: 'https://picsum.photos/seed/ep7/400/700', episode_num: 7, is_free: false, coin_cost: 10 },
      { title: 'The Final Showdown', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnail_url: 'https://picsum.photos/seed/ep8/400/700', episode_num: 8, is_free: false, coin_cost: 10 },
    ];

    for (const ep of episodes) {
      await client.query(
        `INSERT INTO episodes (title, video_url, thumbnail_url, episode_num, is_free, coin_cost) VALUES ($1,$2,$3,$4,$5,$6)`,
        [ep.title, ep.video_url, ep.thumbnail_url, ep.episode_num, ep.is_free, ep.coin_cost]
      );
    }

    console.log(`✅ Seeded ${episodes.length} episodes`);
  } finally {
    client.release();
  }
}

module.exports = { migrate, seed };
