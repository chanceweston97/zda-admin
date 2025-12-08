#!/bin/bash

# Medusa Backend Deployment Script
# This script is run on EC2 when GitHub Actions triggers deployment

set -e  # Exit on error

echo "🚀 Starting Medusa Backend Deployment..."

# Navigate to project directory
cd /opt/medusa/backend || cd ~/zda-admin || exit 1

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
npx medusa db:migrate || echo "⚠️  Migration failed or already up to date"

# Restart the application
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart medusa-backend || pm2 start npm --name medusa-backend -- run start
elif systemctl is-active --quiet medusa-backend; then
    sudo systemctl restart medusa-backend
else
    echo "⚠️  No process manager found. Please restart manually:"
    echo "   pm2 restart medusa-backend"
    echo "   OR"
    echo "   sudo systemctl restart medusa-backend"
fi

echo "✅ Backend deployment completed successfully!"
echo "📍 Check logs: pm2 logs medusa-backend"


