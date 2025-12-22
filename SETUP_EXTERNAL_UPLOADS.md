# Setup External Upload Directory for Medusa

This guide explains how to configure Medusa to use an external upload directory that persists across deployments.

## Why This is Needed

- **Problem**: When you deploy code, `medusa build` creates a fresh `.medusa/server` directory, which can overwrite the `static/` directory containing uploaded product images.
- **Solution**: Store uploads in an external directory (`/var/www/medusa-uploads`) that is **never** touched by deployments.

## One-Time Setup (On Server)

Run these commands **once** on your EC2 server:

```bash
# Create the external upload directory
sudo mkdir -p /var/www/medusa-uploads

# Set ownership to your user (replace 'ubuntu' with your actual username if different)
sudo chown -R ubuntu:ubuntu /var/www/medusa-uploads

# Set permissions (read/write/execute for owner, read/execute for group and others)
sudo chmod -R 755 /var/www/medusa-uploads

# Verify it was created
ls -la /var/www/medusa-uploads
```

## Migrate Existing Uploads (One-Time)

If you have existing uploads in the `backend/static/` directory, move them to the new location:

```bash
cd /opt/medusa/backend  # or your actual backend path

# Move existing uploads to the external directory
if [ -d "static" ] && [ "$(ls -A static)" ]; then
  echo "Migrating existing uploads..."
  sudo cp -r static/* /var/www/medusa-uploads/
  sudo chown -R ubuntu:ubuntu /var/www/medusa-uploads
  echo "✓ Uploads migrated successfully"
  echo "⚠️  Old static/ directory still exists. You can remove it after verifying everything works."
else
  echo "No existing uploads to migrate"
fi
```

## Configure Nginx (If Using Nginx)

If you're serving uploads through Nginx, add this location block to your Nginx config:

```nginx
# Serve static uploads from external directory
location /static/ {
  alias /var/www/medusa-uploads/;
  access_log off;
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

Then reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## How It Works Now

1. **Configuration**: `medusa-config.ts` now uses `/var/www/medusa-uploads` in production
2. **Deployment**: GitHub Actions workflow ensures the directory exists but **never touches its contents**
3. **Builds**: `medusa build` no longer affects uploads
4. **Uploads**: All new product images go to `/var/www/medusa-uploads/`
5. **Safety**: Your code deployments and client's product uploads are completely independent

## Environment Variable

The upload directory is controlled by the `MEDUSA_STATIC_DIR` environment variable:

- **Production**: `/var/www/medusa-uploads` (set in `.medusa/server/.env`)
- **Development**: `./static` (relative path, works locally)

You can override it by setting `MEDUSA_STATIC_DIR` in your `.env` file.

## Verification

After setup, verify it's working:

1. Upload a new product image through the Medusa admin panel
2. Check that it appears in `/var/www/medusa-uploads/`:
   ```bash
   ls -la /var/www/medusa-uploads/
   ```
3. Verify the image URL works in your storefront
4. Deploy a code change and verify the image still works

## Benefits

✅ **No more lost images** - Uploads persist across all deployments  
✅ **Safe deployments** - Code and data are completely separated  
✅ **Scalable** - Can easily move to S3 or CDN later  
✅ **Production-grade** - This is how all major platforms handle uploads  

## Troubleshooting

**Images not showing after setup?**

1. Check directory permissions:
   ```bash
   ls -la /var/www/medusa-uploads
   ```
   Should show `drwxr-xr-x` and owned by your user.

2. Check Medusa logs:
   ```bash
   pm2 logs admin
   ```
   Look for file upload errors.

3. Verify the path in config:
   Check that `.medusa/server/.env` has `MEDUSA_STATIC_DIR=/var/www/medusa-uploads`

4. Test file creation:
   ```bash
   touch /var/www/medusa-uploads/test.txt
   rm /var/www/medusa-uploads/test.txt
   ```
   Should work without errors.

