# Fix: Image URLs Using localhost:9000 Instead of Server URL

## Problem
When uploading images/files through the admin panel, the URLs are saved with `localhost:9000` instead of your actual server URL (e.g., `http://18.191.243.236:9000`).

## Root Cause
The backend's `medusa-config.ts` uses `MEDUSA_BACKEND_URL` environment variable to generate file URLs, but it defaults to `localhost:9000` if not set.

## Solution

### Step 1: Set MEDUSA_BACKEND_URL in Backend .env

On your backend server, edit the `.env` file:

```bash
cd ~/backend  # or wherever your backend is
nano .env
```

Add or update:
```env
MEDUSA_BACKEND_URL=http://18.191.243.236:9000
```

**Important:** 
- Use your actual server IP or domain
- Don't include `/static` at the end
- Use `http://` or `https://` depending on your setup

### Step 2: Restart Backend

After updating the `.env` file, restart your backend:

```bash
pm2 restart Backend
# or
pm2 restart all
```

### Step 3: Verify Configuration

Check that the backend is using the correct URL:

```bash
# In backend directory
node -e "require('dotenv').config(); console.log('Backend URL:', process.env.MEDUSA_BACKEND_URL || 'NOT SET')"
```

### Step 4: Fix Existing URLs (Optional)

If you already have products with `localhost:9000` URLs, you can:

1. **Option A: Update via Admin Panel**
   - Go to each product in Medusa Admin
   - Re-upload the images/files (they'll now use the correct URL)

2. **Option B: Update via Database/API**
   - Use a script to update all existing URLs in the database
   - Replace `localhost:9000` with your server URL

### Step 5: Test

1. Upload a new image/file through the admin panel
2. Check the saved URL - it should now use your server URL instead of `localhost:9000`

## How It Works

The `medusa-config.ts` file uses `MEDUSA_BACKEND_URL` to set the `backend_url`:

```typescript
backend_url: (() => {
  const baseUrl = process.env.MEDUSA_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:9000"
  return baseUrl.endsWith("/static") ? baseUrl : baseUrl + "/static"
})(),
```

When files are uploaded, Medusa's file service uses this `backend_url` to generate the file URLs. By setting `MEDUSA_BACKEND_URL` in your `.env`, all new uploads will use the correct server URL.

## Additional Notes

- The admin widget code has been updated to also handle URL replacement, but the proper fix is setting the environment variable
- If using HTTPS in production, make sure to use `https://` in `MEDUSA_BACKEND_URL`
- If your backend is behind a reverse proxy (nginx, etc.), use the public-facing URL

