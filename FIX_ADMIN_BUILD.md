# Fix Medusa Admin Build Errors

## Problem
The admin panel shows errors like:
- `Failed to fetch dynamically imported module`
- `404 (Not Found)` for Vite dependency files
- WebSocket connection failures

This happens because the backend is running in **development mode** but needs to run in **production mode** with a built admin panel.

## Solution

### Step 1: Stop the Backend
```bash
cd ~/admin/zda-admin
pm2 stop medusaBackend
# OR
pm2 delete medusaBackend
```

### Step 2: Build the Backend
```bash
cd ~/admin/zda-admin
npx medusa build
```

This will:
- Compile TypeScript backend code
- Build the admin panel frontend
- Create `.medusa/admin/index.html` (required for admin)

**Important:** Wait for the build to complete. It may take 2-5 minutes.

### Step 3: Start Backend in Production Mode

**Option A: Using PM2 directly**
```bash
cd ~/admin/zda-admin
NODE_ENV=production pm2 start npm --name medusaBackend -- start
pm2 save
```

**Option B: Using ecosystem.config.js (if you have one)**
```bash
cd ~/admin/zda-admin
# Make sure ecosystem.config.js has NODE_ENV: 'production'
pm2 start ecosystem.config.js
pm2 save
```

### Step 4: Verify It's Working

1. Check PM2 status:
   ```bash
   pm2 status
   pm2 logs medusaBackend --lines 20
   ```

2. Check admin panel:
   - Visit: `http://18.191.243.236:9000/app`
   - Should load without 404 errors
   - No Vite dependency errors

### Troubleshooting

**If build fails:**
```bash
# Check for TypeScript errors
npx medusa build 2>&1 | grep -i error

# Fix any TypeScript errors first
```

**If admin still shows 404s:**
```bash
# Verify build completed
ls -la .medusa/admin/index.html
# Should exist

# Check if backend is reading the build
pm2 logs medusaBackend | grep -i "admin\|index.html"
```

**If backend crashes on startup:**
```bash
# Check logs
pm2 logs medusaBackend --lines 50

# Make sure DATABASE_URL is set
# Make sure all required environment variables are set
```

## Why This Happens

- **Development mode**: Uses Vite dev server (expects `.vite/deps/` files)
- **Production mode**: Uses pre-built admin panel (`.medusa/admin/index.html`)

When running in production, you **must** run `npx medusa build` first.

## Prevention

Always build before starting in production:
```bash
npx medusa build && NODE_ENV=production pm2 start npm --name medusaBackend -- start
```

Or add to your deployment script to always build before starting.

