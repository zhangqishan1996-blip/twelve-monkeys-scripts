require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
const noDb = !dbUrl || dbUrl.includes('REPLACE');

if (noDb) {
  console.warn('⚠️  DATABASE_URL not configured — using in-memory mock DB');
  module.exports = require('./mock');
} else {
  // Test connection; fall back to mock if unreachable
  const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 3000 });
  pool.on('error', () => {});

  let resolved = false;
  const mock = require('./mock');

  const proxyPool = {
    _real: pool,
    _mock: mock,
    _useMock: false,
    async query(sql, params) {
      if (this._useMock) return this._mock.query(sql, params);
      try { return await this._real.query(sql, params); }
      catch (err) {
        if (!resolved) { this._useMock = true; console.warn('⚠️  PostgreSQL unreachable — switched to mock DB'); }
        return this._mock.query(sql, params);
      }
    },
    async connect() {
      if (this._useMock) return this._mock.connect();
      try { return await this._real.connect(); }
      catch { this._useMock = true; return this._mock.connect(); }
    },
    on() {},
  };

  // Probe once at startup
  pool.query('SELECT 1').then(() => {
    resolved = true;
    console.log('✅ PostgreSQL connected');
  }).catch(() => {
    resolved = true;
    proxyPool._useMock = true;
    console.warn('⚠️  PostgreSQL not reachable — using in-memory mock DB (data resets on restart)');
    console.warn('   To use real DB: ensure PostgreSQL is running, or: docker compose up -d');
  });

  module.exports = proxyPool;
}
