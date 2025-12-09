# Admin Login Page Branding Setup

## Overview
This guide explains how to customize the Medusa admin login page with ZDA Communications branding.

## Changes Made

1. **Created Admin Branding Widget** (`backend/src/admin/widgets/admin-branding.tsx`)
   - Replaces "Welcome to Medusa" with "Welcome to ZDA Communications"
   - Changes button colors to brand color (#2958A4)
   - Updates logo (if logo file is available)

## Setup Steps

### 1. Copy Logo File

Copy your logo from the frontend to the backend static folder:

```powershell
# From project root
Copy-Item front/public/images/logo/logo.png backend/static/images/logo/logo.png
```

Or manually:
- Source: `front/public/images/logo/logo.png`
- Destination: `backend/static/images/logo/logo.png`

### 2. Restart Backend Server

After copying the logo, restart your backend server:

```powershell
cd backend
# Stop current server (Ctrl+C)
npm run dev
```

### 3. Verify Changes

1. Open the admin login page: `http://localhost:9000/app`
2. You should see:
   - "Welcome to ZDA Communications" instead of "Welcome to Medusa"
   - ZDA Communications logo (if logo file was copied)
   - Login button with brand color (#2958A4)

## How It Works

The `admin-branding.tsx` widget:
- Injects custom CSS to style buttons with brand colors
- Uses DOM manipulation to replace text and update logos
- Runs on all admin pages, including the login page

## Troubleshooting

### Logo Not Showing

1. **Check if logo file exists:**
   ```powershell
   Test-Path backend/static/images/logo/logo.png
   ```

2. **Verify file path:**
   - Logo should be at: `backend/static/images/logo/logo.png`
   - Medusa serves static files from the `static` folder

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for image load errors
   - Check Network tab for failed image requests

### Text Not Replaced

1. **Check if widget is loaded:**
   - Open browser console
   - Look for any errors related to the widget

2. **Verify widget is in correct location:**
   - File should be at: `backend/src/admin/widgets/admin-branding.tsx`

3. **Restart backend server:**
   - Widgets are loaded when the server starts

### Button Colors Not Changed

1. **Check CSS injection:**
   - Open DevTools > Elements
   - Look for `<style id="zda-admin-branding">` in `<head>`
   - Verify CSS rules are present

2. **Check button selectors:**
   - Inspect the login button
   - Verify it matches one of the CSS selectors
   - Check if other CSS is overriding our styles

## Manual Override (If Widget Doesn't Work)

If the widget doesn't work on the login page (some versions of Medusa don't support widgets on login), you can:

1. **Use browser extension** to inject CSS
2. **Modify Medusa admin source** (not recommended, will be overwritten on updates)
3. **Use a reverse proxy** to inject custom CSS/JS

## Notes

- The widget uses `zone: "login.before"` which may not be supported in all Medusa versions
- If the login page doesn't support widgets, the button colors will still work on other admin pages
- Logo replacement requires the logo file to be in the correct location

