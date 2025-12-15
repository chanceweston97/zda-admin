# Fix: Admin Panel Running in Development Mode

## Problem
The admin panel is trying to load Vite dev server files (`@fs` paths), which indicates it's running in development mode instead of production mode.

## Solution

### Step 1: Set NODE_ENV=production

On your server, update your PM2 process to use production mode:

```bash
# Stop the current process
pm2 stop medusaBackend

# Delete the old process
pm2 delete medusaBackend

# Start in production mode
cd ~/admin/zda-admin
NODE_ENV=production pm2 start npm --name medusaBackend -- start

# OR if you're using yarn
NODE_ENV=production pm2 start yarn --name medusaBackend -- start

# Save PM2 configuration
pm2 save
```

### Step 2: Alternative - Create/Update PM2 Ecosystem File

Create `ecosystem.config.js` in the backend directory:

```javascript
module.exports = {
  apps: [{
    name: 'medusaBackend',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/admin/zda-admin',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

Then use:
```bash
pm2 delete medusaBackend
pm2 start ecosystem.config.js
pm2 save
```

### Step 3: Verify Build Exists

Make sure the admin build exists:

```bash
cd ~/admin/zda-admin
ls -la .medusa/admin/index.html

# If it doesn't exist, rebuild:
yarn build
# or
npm run build
```

### Step 4: Restart PM2

```bash
pm2 restart medusaBackend
pm2 logs medusaBackend
```

## Key Points

- **Development mode** (`medusa develop` or `NODE_ENV=development`) uses Vite dev server
- **Production mode** (`medusa start` with `NODE_ENV=production`) uses pre-built admin files
- Always use `medusa start` (not `medusa develop`) in production
- Always set `NODE_ENV=production` when running on server

