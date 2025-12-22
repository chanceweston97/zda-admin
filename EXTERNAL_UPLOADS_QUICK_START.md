# Quick Start: External Upload Directory Setup

## 🎯 Problem Solved

✅ **Before**: Product images lost when deploying code  
✅ **After**: Product images persist across all deployments

## 🚀 One-Time Server Setup (Run on EC2)

```bash
# 1. Create external upload directory
sudo mkdir -p /var/www/medusa-uploads
sudo chown -R $USER:$USER /var/www/medusa-uploads
sudo chmod -R 755 /var/www/medusa-uploads

# 2. Migrate existing uploads (if any)
cd /opt/medusa/backend  # or your actual backend path
bash scripts/migrate-uploads-to-external.sh

# 3. Verify
ls -la /var/www/medusa-uploads
```

## ✅ What Changed

1. **medusa-config.ts**: Now uses `/var/www/medusa-uploads` in production
2. **deploy.yml**: Removed static directory preservation logic (no longer needed)
3. **Environment**: `MEDUSA_STATIC_DIR` set in `.medusa/server/.env`

## 🔍 Verify It Works

1. Upload a product image via Medusa admin
2. Check it exists: `ls -la /var/www/medusa-uploads/`
3. Deploy code changes
4. Verify image still works ✅

## 📚 Full Documentation

See `SETUP_EXTERNAL_UPLOADS.md` for complete details.

