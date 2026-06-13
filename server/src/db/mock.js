/**
 * In-memory mock database for development without PostgreSQL.
 * Activated automatically when DATABASE_URL is missing or DB is unreachable.
 */

let users = [
  { id: 1, email: 'demo@example.com', password_hash: 'demo', coins_balance: 100 }
]
let episodes = [
  { id: 1, title: "The Billionaire's Secret", video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnail_url: 'https://picsum.photos/seed/ep1/400/700', episode_num: 1, is_free: true, coin_cost: 0 },
  { id: 2, title: 'Love at First Sight', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnail_url: 'https://picsum.photos/seed/ep2/400/700', episode_num: 2, is_free: true, coin_cost: 0 },
  { id: 3, title: 'Hidden Heir Returns', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnail_url: 'https://picsum.photos/seed/ep3/400/700', episode_num: 3, is_free: false, coin_cost: 10 },
  { id: 4, title: "CEO's Forbidden Love", video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnail_url: 'https://picsum.photos/seed/ep4/400/700', episode_num: 4, is_free: false, coin_cost: 10 },
  { id: 5, title: 'Revenge of the Scorned', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnail_url: 'https://picsum.photos/seed/ep5/400/700', episode_num: 5, is_free: false, coin_cost: 10 },
  { id: 6, title: 'The Mysterious Stranger', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumbnail_url: 'https://picsum.photos/seed/ep6/400/700', episode_num: 6, is_free: false, coin_cost: 10 },
  { id: 7, title: 'Destined to Be Together', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', thumbnail_url: 'https://picsum.photos/seed/ep7/400/700', episode_num: 7, is_free: false, coin_cost: 10 },
  { id: 8, title: 'The Final Showdown', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnail_url: 'https://picsum.photos/seed/ep8/400/700', episode_num: 8, is_free: false, coin_cost: 10 },
]
let unlocked = []
let nextUserId = 2

function mockQuery(sql, params = []) {
  sql = sql.trim().toUpperCase()

  // CREATE TABLE — no-op
  if (sql.startsWith('CREATE TABLE')) return { rows: [] }
  if (sql.startsWith('BEGIN') || sql.startsWith('COMMIT') || sql.startsWith('ROLLBACK')) return { rows: [] }

  // SELECT COUNT(*) FROM EPISODES
  if (sql.includes('COUNT(*)') && sql.includes('EPISODES')) {
    return { rows: [{ count: String(episodes.length) }] }
  }

  // INSERT INTO EPISODES
  if (sql.startsWith('INSERT INTO EPISODES')) return { rows: [] }

  // SELECT episodes with unlock status
  if (sql.includes('FROM EPISODES') && sql.includes('LEFT JOIN')) {
    const userId = params[0]
    return {
      rows: episodes.map(e => ({
        ...e,
        is_unlocked: unlocked.some(u => u.user_id === userId && u.video_id === e.id)
      }))
    }
  }

  // SELECT episodes without join
  if (sql.includes('FROM EPISODES') && sql.includes('IS_UNLOCKED')) {
    return { rows: episodes.map(e => ({ ...e, is_unlocked: false })) }
  }
  if (sql.includes('FROM EPISODES') && !sql.includes('WHERE')) {
    return { rows: episodes.map(e => ({ ...e, is_unlocked: false })) }
  }

  // SELECT * FROM EPISODES WHERE id=
  if (sql.includes('FROM EPISODES WHERE ID=')) {
    const id = parseInt(params[0])
    const ep = episodes.find(e => e.id === id)
    return { rows: ep ? [ep] : [] }
  }

  // INSERT users
  if (sql.startsWith('INSERT INTO USERS')) {
    const [email, , coins] = params
    const existing = users.find(u => u.email === email)
    if (existing) throw Object.assign(new Error('duplicate'), { code: '23505' })
    const user = { id: nextUserId++, email, password_hash: params[1], coins_balance: coins || 100 }
    users.push(user)
    return { rows: [{ id: user.id, email: user.email, coins_balance: user.coins_balance }] }
  }

  // SELECT users (login)
  if (sql.includes('FROM USERS WHERE EMAIL=')) {
    const [email, hash] = params
    const user = users.find(u => u.email === email && u.password_hash === hash)
    return { rows: user ? [{ id: user.id, email: user.email, coins_balance: user.coins_balance }] : [] }
  }

  // SELECT coins_balance (handles FOR UPDATE too)
  if (sql.includes('FROM USERS WHERE ID=') && sql.startsWith('SELECT')) {
    const user = users.find(u => u.id === params[0])
    return { rows: user ? [{ coins_balance: user.coins_balance }] : [] }
  }

  // UPDATE users coins (subtract: SET coins_balance = coins_balance - $1)
  if (sql.startsWith('UPDATE USERS SET COINS_BALANCE')) {
    const amount = params[0]  // coin_cost to subtract
    const userId = params[1]
    const user = users.find(u => u.id === userId)
    if (user) user.coins_balance -= amount
    return { rows: [] }
  }

  // SELECT unlocked_contents
  if (sql.includes('FROM UNLOCKED_CONTENTS WHERE USER_ID=')) {
    const [userId, videoId] = params
    const found = unlocked.find(u => u.user_id === userId && u.video_id === videoId)
    return { rows: found ? [found] : [] }
  }

  // INSERT unlocked_contents
  if (sql.startsWith('INSERT INTO UNLOCKED_CONTENTS')) {
    const [userId, videoId] = params
    if (!unlocked.find(u => u.user_id === userId && u.video_id === videoId)) {
      unlocked.push({ user_id: userId, video_id: videoId })
    }
    return { rows: [] }
  }

  // Stripe sessions — ignore in mock
  if (sql.includes('STRIPE_SESSIONS')) return { rows: [] }

  return { rows: [] }
}

const mockClient = {
  query: (sql, params) => Promise.resolve(mockQuery(sql, params)),
  release: () => {}
}

const mockPool = {
  query: (sql, params) => Promise.resolve(mockQuery(sql, params)),
  connect: () => Promise.resolve(mockClient),
  on: () => {},
}

module.exports = mockPool
