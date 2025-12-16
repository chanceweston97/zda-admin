#!/bin/bash
# Quick fix script to build Medusa admin panel on EC2

set -e

echo "=== Medusa Admin Build Fix Script ==="

# Navigate to app directory (adjust path if needed)
cd /home/ubuntu/admin || cd ~/admin || exit 1

echo "Current directory: $(pwd)"

# Stop PM2 to prevent conflicts
echo "Stopping PM2..."
pm2 stop medusaBackend || true

# Load NVM if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Enable corepack and yarn
echo "Setting up yarn..."
corepack enable || true
corepack prepare yarn@4.6.0 --activate || true

# Install dependencies if needed
echo "Installing dependencies..."
yarn install --immutable || yarn install

# Set environment variables
BACKEND_URL="http://$(hostname -I | awk '{print $1}'):9000"
export MEDUSA_BACKEND_URL="$BACKEND_URL"
echo "MEDUSA_BACKEND_URL=$BACKEND_URL" >> .env

# Ensure static directory exists
mkdir -p static

# Clean build caches
echo "Cleaning build caches..."
rm -rf .medusa
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Build admin panel
echo "Building admin panel (this may take 3-5 minutes)..."
NODE_OPTIONS="--max-old-space-size=4096" npx medusa build

# Verify build was successful
if [ ! -f ".medusa/admin/index.html" ]; then
  echo "ERROR: Build failed - index.html not found!"
  echo "Checking what was created:"
  ls -la .medusa/ 2>/dev/null || echo ".medusa directory doesn't exist"
  exit 1
fi

echo "✓ Build successful! index.html found at .medusa/admin/index.html"
ls -lh .medusa/admin/index.html

# Restart PM2
echo "Restarting PM2..."
pm2 delete medusaBackend || true
pm2 start yarn --name medusaBackend -- start
pm2 save

echo "=== Done! Check logs with: pm2 logs medusaBackend ==="

