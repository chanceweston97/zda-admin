#!/bin/bash
# Quick fix: Build admin and copy to correct location for medusa start

set -e

cd ~/admin || cd /home/ubuntu/admin || exit 1

echo "=== Fixing Medusa Admin Build ==="

# Stop PM2
echo "Stopping PM2..."
pm2 stop medusaBackend || true

# Setup environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Set environment
export NODE_ENV=production
BACKEND_URL="http://$(hostname -I | awk '{print $1}'):9000"
export MEDUSA_BACKEND_URL="$BACKEND_URL"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf .medusa
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Build
echo "Building Medusa (3-5 minutes)..."
NODE_OPTIONS="--max-old-space-size=4096" yarn build

# Copy client to admin (Medusa v2 fix)
if [ -f ".medusa/client/index.html" ]; then
  echo "✓ Found build at .medusa/client/index.html"
  mkdir -p .medusa/admin
  cp -r .medusa/client/* .medusa/admin/
  echo "✓ Copied to .medusa/admin/"
else
  echo "ERROR: Build failed - .medusa/client/index.html not found"
  exit 1
fi

# Verify
if [ ! -f ".medusa/admin/index.html" ]; then
  echo "ERROR: Verification failed"
  exit 1
fi

echo "✓ Build successful!"

# Restart PM2
echo "Restarting PM2..."
pm2 delete medusaBackend || true
pm2 start yarn --name medusaBackend -- start
pm2 save

echo "=== Done! Check logs: pm2 logs medusaBackend ==="

