// PM2 production process manager config
// Usage: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [{
    name: 'twelve-monkeys-api',
    script: './src/index.js',
    instances: 'max',          // one process per CPU core
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file:   './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    restart_delay: 3000,
    exp_backoff_restart_delay: 100,
  }],
};
