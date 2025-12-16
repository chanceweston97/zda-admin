#!/bin/bash
# Verify exact path and fix any issues

set -e

cd ~/admin || cd /home/ubuntu/admin || exit 1

echo "=== Verifying Admin Build Path ==="
echo "Current directory: $(pwd)"
echo ""

# Check if file exists with absolute path
ABSOLUTE_PATH="$(pwd)/.medusa/admin/index.html"
echo "1. Checking absolute path: $ABSOLUTE_PATH"
if [ -f "$ABSOLUTE_PATH" ]; then
  echo "   ✓ File exists at absolute path"
  ls -lh "$ABSOLUTE_PATH"
  echo "   Permissions: $(stat -c '%a %U:%G' "$ABSOLUTE_PATH")"
else
  echo "   ✗ File NOT found at absolute path"
fi

echo ""
echo "2. Checking relative path: .medusa/admin/index.html"
if [ -f ".medusa/admin/index.html" ]; then
  echo "   ✓ File exists at relative path"
  ls -lh .medusa/admin/index.html
else
  echo "   ✗ File NOT found at relative path"
fi

echo ""
echo "3. Checking .medusa/admin directory structure:"
if [ -d ".medusa/admin" ]; then
  echo "   Directory exists"
  echo "   Contents (first 10 files):"
  ls -la .medusa/admin/ | head -10
  echo ""
  echo "   Total files: $(find .medusa/admin -type f | wc -l)"
  echo "   Total dirs: $(find .medusa/admin -type d | wc -l)"
else
  echo "   ✗ Directory does NOT exist"
fi

echo ""
echo "4. Checking .medusa/client directory:"
if [ -d ".medusa/client" ]; then
  echo "   Directory exists"
  if [ -f ".medusa/client/index.html" ]; then
    echo "   ✓ index.html exists in client"
    ls -lh .medusa/client/index.html
  else
    echo "   ✗ index.html NOT in client"
  fi
else
  echo "   ✗ Directory does NOT exist"
fi

echo ""
echo "5. Finding ALL index.html files in .medusa:"
find .medusa -name "index.html" -type f 2>/dev/null | while read file; do
  echo "   Found: $file"
  ls -lh "$file"
done

echo ""
echo "=== FIXING ==="

# Stop PM2
pm2 stop medusaBackend || true

# Remove admin completely
echo "Removing .medusa/admin..."
rm -rf .medusa/admin

# Rebuild if client doesn't exist
if [ ! -f ".medusa/client/index.html" ]; then
  echo "Client build missing, rebuilding..."
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  export NODE_ENV=production
  rm -rf .medusa
  NODE_OPTIONS="--max-old-space-size=4096" yarn build
fi

# Create admin directory fresh
echo "Creating .medusa/admin..."
mkdir -p .medusa/admin

# Copy with verbose output
echo "Copying files..."
cp -rv .medusa/client/. .medusa/admin/ 2>&1 | head -20

# Verify
echo ""
echo "Verification:"
if [ -f ".medusa/admin/index.html" ]; then
  echo "✓ SUCCESS: .medusa/admin/index.html exists"
  ls -lh .medusa/admin/index.html
  file .medusa/admin/index.html
  echo ""
  echo "Testing read access:"
  head -5 .medusa/admin/index.html
else
  echo "✗ FAILED: .medusa/admin/index.html still not found"
  echo "Admin directory contents:"
  ls -la .medusa/admin/
  exit 1
fi

# Check if PM2 is running from correct directory
echo ""
echo "6. Checking PM2 process working directory:"
pm2 describe medusaBackend 2>/dev/null | grep "cwd" || echo "   PM2 process not running"

# Restart PM2
echo ""
echo "Restarting PM2..."
pm2 delete medusaBackend || true
cd "$(pwd)"  # Ensure we're in the right directory
pm2 start yarn --name medusaBackend -- start --cwd "$(pwd)"
pm2 save

echo ""
echo "=== DONE ==="
echo "Wait 5 seconds, then check logs..."
sleep 5
pm2 logs medusaBackend --lines 15 --nostream

