#!/bin/bash
# Comprehensive diagnostic and fix script for Medusa admin build issue

set -e

cd ~/admin || cd /home/ubuntu/admin || exit 1

echo "=== Medusa Admin Build Diagnostic & Fix ==="
echo ""

# Step 1: Check current state
echo "1. Checking current .medusa structure..."
if [ -d ".medusa" ]; then
  echo "   .medusa directory exists"
  echo "   Contents:"
  ls -la .medusa/ | head -10
else
  echo "   ✗ .medusa directory does NOT exist"
fi

echo ""
echo "2. Checking for client build..."
if [ -f ".medusa/client/index.html" ]; then
  echo "   ✓ Found .medusa/client/index.html"
  ls -lh .medusa/client/index.html
  echo "   Client directory contents:"
  ls -la .medusa/client/ | head -5
else
  echo "   ✗ .medusa/client/index.html NOT found"
  if [ -d ".medusa/client" ]; then
    echo "   But .medusa/client directory exists:"
    ls -la .medusa/client/ | head -10
  fi
fi

echo ""
echo "3. Checking for admin build..."
if [ -f ".medusa/admin/index.html" ]; then
  echo "   ✓ Found .medusa/admin/index.html"
  ls -lh .medusa/admin/index.html
else
  echo "   ✗ .medusa/admin/index.html NOT found"
  if [ -d ".medusa/admin" ]; then
    echo "   But .medusa/admin directory exists:"
    ls -la .medusa/admin/ | head -10
    echo "   Checking if it's a symlink:"
    ls -la .medusa/ | grep admin
  fi
fi

echo ""
echo "4. Finding all index.html files..."
find .medusa -name "index.html" -type f 2>/dev/null || echo "   No index.html files found"

echo ""
echo "=== FIXING ==="

# Stop PM2
echo "Stopping PM2..."
pm2 stop medusaBackend || true

# Setup environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Clean and rebuild if needed
if [ ! -f ".medusa/client/index.html" ]; then
  echo "Client build missing, rebuilding..."
  export NODE_ENV=production
  rm -rf .medusa
  NODE_OPTIONS="--max-old-space-size=4096" yarn build
fi

# Verify client build exists
if [ ! -f ".medusa/client/index.html" ]; then
  echo "ERROR: Build failed - .medusa/client/index.html still not found after rebuild"
  exit 1
fi

echo "✓ Client build verified"

# Remove old admin directory completely (including if it's a symlink)
echo "Removing old .medusa/admin..."
rm -rf .medusa/admin

# Create admin directory
echo "Creating .medusa/admin directory..."
mkdir -p .medusa/admin

# Copy ALL files including hidden ones (using . to copy everything)
echo "Copying client build to admin (including hidden files)..."
cp -r .medusa/client/. .medusa/admin/

# Verify the copy worked
echo "Verifying copy..."
if [ ! -f ".medusa/admin/index.html" ]; then
  echo "ERROR: Copy failed - .medusa/admin/index.html not found after copy"
  echo "Admin directory contents:"
  ls -la .medusa/admin/ | head -10
  exit 1
fi

echo "✓ Copy successful!"
echo "Verification:"
ls -lh .medusa/admin/index.html
echo ""
echo "Admin directory file count:"
echo "  Client: $(find .medusa/client -type f | wc -l) files"
echo "  Admin:  $(find .medusa/admin -type f | wc -l) files"

# Check if file is readable
if [ -r ".medusa/admin/index.html" ]; then
  echo "✓ File is readable"
else
  echo "✗ WARNING: File exists but is not readable!"
fi

# Restart PM2
echo ""
echo "Restarting PM2..."
pm2 delete medusaBackend || true
pm2 start yarn --name medusaBackend -- start
pm2 save

echo ""
echo "=== DONE ==="
echo "Check logs with: pm2 logs medusaBackend --lines 20"

