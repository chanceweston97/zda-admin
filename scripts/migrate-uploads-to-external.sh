#!/bin/bash

# Migration Script: Move uploads from backend/static to /var/www/medusa-uploads
# Run this ONCE on your server after setting up the external directory

set -e

BACKEND_DIR="${1:-/opt/medusa/backend}"
EXTERNAL_UPLOAD_DIR="/var/www/medusa-uploads"
OLD_STATIC_DIR="$BACKEND_DIR/static"

echo "🔄 Migrating uploads to external directory..."
echo "   From: $OLD_STATIC_DIR"
echo "   To:   $EXTERNAL_UPLOAD_DIR"
echo ""

# Check if external directory exists
if [ ! -d "$EXTERNAL_UPLOAD_DIR" ]; then
  echo "❌ External upload directory does not exist: $EXTERNAL_UPLOAD_DIR"
  echo "   Run setup commands first:"
  echo "   sudo mkdir -p $EXTERNAL_UPLOAD_DIR"
  echo "   sudo chown -R \$USER:\$USER $EXTERNAL_UPLOAD_DIR"
  echo "   sudo chmod -R 755 $EXTERNAL_UPLOAD_DIR"
  exit 1
fi

# Check if old static directory exists and has files
if [ ! -d "$OLD_STATIC_DIR" ]; then
  echo "ℹ️  No existing static directory found at $OLD_STATIC_DIR"
  echo "   Nothing to migrate."
  exit 0
fi

if [ ! "$(ls -A $OLD_STATIC_DIR)" ]; then
  echo "ℹ️  Static directory is empty. Nothing to migrate."
  exit 0
fi

# Count files
FILE_COUNT=$(find "$OLD_STATIC_DIR" -type f | wc -l)
echo "📊 Found $FILE_COUNT files to migrate"
echo ""

# Ask for confirmation
read -p "Do you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Migration cancelled"
  exit 0
fi

# Copy files (not move, to be safe)
echo "📁 Copying files..."
sudo cp -r "$OLD_STATIC_DIR"/* "$EXTERNAL_UPLOAD_DIR/"

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R $(whoami):$(whoami) "$EXTERNAL_UPLOAD_DIR"
sudo chmod -R 755 "$EXTERNAL_UPLOAD_DIR"

# Verify
NEW_FILE_COUNT=$(find "$EXTERNAL_UPLOAD_DIR" -type f | wc -l)
echo ""
echo "✅ Migration complete!"
echo "   Files in external directory: $NEW_FILE_COUNT"
echo ""
echo "⚠️  Old files still exist in $OLD_STATIC_DIR"
echo "   After verifying everything works, you can remove it with:"
echo "   rm -rf $OLD_STATIC_DIR"
echo ""
echo "🔍 Verify files:"
echo "   ls -la $EXTERNAL_UPLOAD_DIR"

