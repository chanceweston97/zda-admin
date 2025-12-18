# CMS Route 404 Fix

## Issue
All CMS child routes (heroes, instructions, etc.) were showing 404 errors.

## Root Cause
In Medusa v2, admin routes are automatically created based on folder structure. The `path` property in the route config was conflicting with the automatic route registration.

## Solution
Removed the `path` property from all route configs. Medusa v2 automatically creates routes based on folder structure:
- `routes/cms/page.tsx` → `/app/cms`
- `routes/cms/heroes/page.tsx` → `/app/cms/heroes`
- `routes/cms/instructions/page.tsx` → `/app/cms/instructions`
- etc.

## Changes Made
- Removed `path: "/cms"` from `routes/cms/page.tsx`
- Removed `path: "/cms/heroes"` from `routes/cms/heroes/page.tsx`
- Removed `path: "/cms/instructions"` from `routes/cms/instructions/page.tsx`
- Removed `path: "/cms/proud-partners"` from `routes/cms/proud-partners/page.tsx`
- Removed `path: "/cms/what-we-offer"` from `routes/cms/what-we-offer/page.tsx`
- Removed `path: "/cms/our-story"` from `routes/cms/our-story/page.tsx`
- Removed `path: "/cms/faqs"` from `routes/cms/faqs/page.tsx`

## Next Steps
1. **Rebuild the admin:**
   ```bash
   cd backend
   yarn build
   ```

2. **Restart the server:**
   ```bash
   yarn dev
   # or on server
   pm2 restart medusa-backend
   ```

3. **Clear browser cache** and test the routes again.

The routes should now work correctly at:
- `/app/cms` - CMS Dashboard
- `/app/cms/heroes` - Hero Banners
- `/app/cms/instructions` - Hero Introduction
- `/app/cms/proud-partners` - Proud Partners
- `/app/cms/what-we-offer` - What We Offer
- `/app/cms/our-story` - Our Story
- `/app/cms/faqs` - FAQs

