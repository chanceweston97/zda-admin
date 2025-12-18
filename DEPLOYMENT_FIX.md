# Deployment Workflow Fix

## ✅ Changes Made

### 1. Fixed Deployment Workflow
**Problem**: The workflow was trying to clone a different repository (`zda-admin`) instead of deploying the current repository's code.

**Solution**: Updated workflow to:
1. **Checkout current repository** - Uses `actions/checkout@v3` to get the code from the current repo
2. **Upload code via SCP** - Uses `appleboy/scp-action` to copy all files to the server
3. **Build and restart** - Runs build and restart commands on the server

### 2. Fixed medusa-config.ts
- Updated `getBackendUrl()` to return base URL only (not `/static` suffix)
- Added comments explaining Medusa's automatic static file serving

## 📋 New Workflow Steps

1. **Checkout code** - Gets code from current repository
2. **Upload to EC2** - Copies all files to server using SCP
3. **Build and restart** - Installs dependencies, builds, and restarts PM2

## 🔧 Key Improvements

- ✅ Uses current repository code (not cloning different repo)
- ✅ Uploads all files including CMS module
- ✅ Builds backend before starting
- ✅ Creates static directory if missing
- ✅ Sets proper environment variables
- ✅ Uses `yarn start` (production mode) instead of `yarn dev`

## 🚀 How It Works

1. **On push to main branch**:
   - GitHub Actions checks out your code
   - Uploads entire backend directory to EC2
   - Runs build and restart on server

2. **On server**:
   - Creates static directory
   - Installs dependencies
   - Builds backend
   - Restarts PM2 process

## ⚙️ Required Secrets

Make sure these secrets are set in GitHub:
- `EC2_HOST` - Your EC2 server IP/hostname
- `EC2_USER` - SSH username (usually `ubuntu`)
- `EC2_KEY` - SSH private key
- `APP_PATH` - Path on server (e.g., `/home/ubuntu/admin`)

## 📝 Next Steps

1. **Commit and push** the updated workflow:
   ```bash
   git add .github/workflows/deploy.yml
   git add medusa-config.ts
   git commit -m "Fix deployment workflow to deploy current repo code"
   git push origin main
   ```

2. **Monitor deployment**:
   - Go to GitHub Actions tab
   - Watch the deployment workflow run
   - Check logs if there are any errors

3. **Verify on server**:
   ```bash
   # SSH into server
   cd ~/admin  # or your APP_PATH
   ls -la src/modules/cms/  # Should see CMS module files
   pm2 logs medusa-backend  # Check if server started successfully
   ```

## ✅ Expected Result

After pushing to main:
- ✅ All code (including CMS module) is deployed to server
- ✅ Backend builds successfully
- ✅ Server starts without "Cannot find module" errors
- ✅ CMS module loads correctly
- ✅ Static files are accessible

## 🔍 Troubleshooting

### If deployment fails:

1. **Check GitHub Actions logs** - Look for error messages
2. **Verify secrets are set** - Go to Settings > Secrets and variables > Actions
3. **Check server permissions** - Ensure APP_PATH is writable
4. **Verify SSH key** - Make sure EC2_KEY secret is correct

### If code doesn't appear on server:

1. **Check SCP upload step** - Look for "Upload code to EC2" in logs
2. **Verify APP_PATH** - Make sure the path exists and is correct
3. **Check file permissions** - Files should be readable

