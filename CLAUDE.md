# ShortDrama Outbound System

## Architecture

### Backend `/server`
- Runtime: Node.js 18+
- Framework: Express.js
- Database: PostgreSQL (via `pg` driver)
- Auth: JWT (jsonwebtoken)
- Payments: Stripe SDK
- Port: 3000

### Frontend `/client`
- Framework: Vue 3 (Composition API, `<script setup>`)
- Build tool: Vite
- Styling: TailwindCSS v3
- HTTP: Axios
- i18n: vue-i18n v9
- Port: 5173

## Database Schema

```sql
users            (id, email, coins_balance)
episodes         (id, title, video_url, episode_num, is_free, coin_cost)
unlocked_contents (user_id, video_id)
```

## Key Features
- Mobile-vertical TikTok-style swipe video player
- Paywall modal on locked episodes (10 coins default)
- Stripe checkout → webhook → auto coin credit
- Language picker: English / Español / 繁體中文
- Watch Ad simulation (30s countdown) to unlock episode

## Environment Variables (server)
```
DATABASE_URL=postgresql://localhost:5432/shortdrama
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=changeme
PORT=3000
CLIENT_URL=http://localhost:5173
```
