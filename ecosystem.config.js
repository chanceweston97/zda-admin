module.exports = {
  apps: [{
    name: 'medusaBackend',
    script: 'yarn',
    args: 'start',
    cwd: '/home/ubuntu/admin',
    env: {
      NODE_ENV: 'production',
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
    },
    error_file: '/home/ubuntu/.pm2/logs/medusaBackend-error.log',
    out_file: '/home/ubuntu/.pm2/logs/medusaBackend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}

