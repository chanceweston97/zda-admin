# Verify and Fix Admin Build

## Current Error
```
Could not find index.html in the admin build directory. 
Make sure to run 'medusa build' before starting the server.
```

## Step-by-Step Fix

### Step 1: Verify Current State
```bash
cd ~/admin/zda-admin

# Check if build directory exists
ls -la .medusa/admin/

# Check if index.html exists
ls -la .medusa/admin/index.html
```

### Step 2: Clean and Rebuild
```bash
cd ~/admin/zda-admin

# Stop the backend
pm2 stop medusaBackend

# Clean previous builds
rm -rf .medusa
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Rebuild everything
npx medusa build

# Wait for it to complete - this can take 3-5 minutes
# Look for: "info: Build completed successfully"
```

### Step 3: Verify Build Output
```bash
# Check if index.html was created
ls -la .medusa/admin/index.html

# Should show something like:
# -rw-r--r-- 1 ubuntu ubuntu 12345 Dec 15 18:57 .medusa/admin/index.html
```

### Step 4: If Build Fails

**Check for TypeScript errors:**
```bash
npx medusa build 2>&1 | tee build.log
grep -i error build.log
```

**Common issues:**
1. **TypeScript compilation errors** - Fix these first
2. **Missing dependencies** - Run `yarn install`
3. **Out of memory** - Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npx medusa build`

### Step 5: Start in Production Mode
```bash
cd ~/admin/zda-admin

# Make sure index.html exists first
if [ ! -f .medusa/admin/index.html ]; then
  echo "ERROR: Build failed. index.html not found!"
  exit 1
fi

# Start with production mode
NODE_ENV=production pm2 delete medusaBackend
NODE_ENV=production pm2 start npm --name medusaBackend -- start
pm2 save
```

### Step 6: Check Logs
```bash
pm2 logs medusaBackend --lines 30

# Should NOT see:
# "Could not find index.html"

# Should see:
# "Server is ready on port: 9000"
```

## Alternative: Build with More Memory
If build fails due to memory issues:

```bash
cd ~/admin/zda-admin
NODE_OPTIONS="--max-old-space-size=4096" npx medusa build
```

## Check Build Script in package.json
Make sure your package.json has:
```json
{
  "scripts": {
    "build": "medusa build",
    "start": "medusa start"
  }
}
```

