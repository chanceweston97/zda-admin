# How External Upload Directory Works

## Your Exact Scenario - Explained

### The Problem You Described

```
1. You work locally → push code changes
2. Server rebuilds (npx medusa build) 
3. Build creates NEW static/ directory with different file names
4. Database still points to old file paths → ❌ Images break
```

### The Solution - Step by Step

#### ✅ **Before Setup (Current Problem)**

```
backend/
├── static/                    ← Inside project (GONE after rebuild)
│   ├── 1765281353194-image.jpg
│   └── 1765282841757-pdf.pdf
└── .medusa/server/            ← Created by medusa build
    └── static/                ← NEW directory, empty or different files
```

**Result**: Database points to `1765281353194-image.jpg` but file doesn't exist → 404

#### ✅ **After Setup (Fixed)**

```
/var/www/
└── medusa-uploads/            ← EXTERNAL, outside project
    ├── 1765281353194-image.jpg  ← Persists forever
    └── 1765282841757-pdf.pdf    ← Never touched by builds

backend/
└── .medusa/server/            ← Rebuilt, but doesn't matter
    └── (no static directory here)
```

**Result**: Database points to `/static/1765281353194-image.jpg` → Medusa serves from `/var/www/medusa-uploads/` → ✅ Works!

## How It Works Technically

### 1. Configuration (`medusa-config.ts`)

```javascript
upload_dir: process.env.MEDUSA_STATIC_DIR || (
  (process.env.NODE_ENV === 'production' || process.env.MEDUSA_ADMIN_URL)
    ? '/var/www/medusa-uploads'  // ← Absolute path (production)
    : join(process.cwd(), 'static') // ← Relative path (development)
)
```

**What happens:**
- **Local (`yarn dev`)**: Uses `./static` → works normally
- **Production**: Uses `/var/www/medusa-uploads` → absolute path, never touched by builds

### 2. When You Push Code

```
You push code
    ↓
GitHub Actions runs
    ↓
npx medusa build (creates .medusa/server/)
    ↓
Medusa reads medusa-config.ts
    ↓
Config says: upload_dir = '/var/www/medusa-uploads'
    ↓
✅ Medusa uses external directory (not .medusa/server/static)
```

### 3. When Client Uploads Product

```
Client uploads image via admin panel
    ↓
Medusa file-local provider receives file
    ↓
Reads upload_dir from config = '/var/www/medusa-uploads'
    ↓
Saves file: /var/www/medusa-uploads/1765469493297-image.jpg
    ↓
Saves URL to database: /static/1765469493297-image.jpg
    ↓
✅ File persists in external directory forever
```

### 4. When You Deploy Code Changes

```
You push code → Server rebuilds → medusa start
    ↓
Medusa reads config → upload_dir = '/var/www/medusa-uploads'
    ↓
✅ Still uses same external directory
✅ All existing files still there
✅ Database URLs still work
✅ Client's images still visible
```

## Key Points

### ✅ **What Changes**
- Configuration code (`medusa-config.ts`)
- Deployment script (removes static preservation logic)

### ✅ **What Never Changes**
- `/var/www/medusa-uploads/` directory (never touched)
- Existing uploaded files (never deleted)
- Database URLs (still work because path is same)

### ✅ **Why It Works**

1. **Absolute Path**: `/var/www/medusa-uploads` is outside the project
2. **Build Independence**: `medusa build` only touches `.medusa/server/`, not external paths
3. **Runtime Config**: Medusa reads config at runtime, always gets same path
4. **Environment Variable**: `MEDUSA_STATIC_DIR` explicitly set in production `.env`

## Verification Steps

After setup, test this exact scenario:

```bash
# 1. Client uploads a product image
# 2. Check it exists
ls -la /var/www/medusa-uploads/ | grep "1765"

# 3. You push code changes
git push

# 4. Server rebuilds automatically
# (happens via GitHub Actions)

# 5. Check file STILL exists (it should!)
ls -la /var/www/medusa-uploads/ | grep "1765"

# 6. Check product image still shows in storefront
# ✅ Should work!
```

## Summary

**Your workflow:**
1. ✅ You push code → Server rebuilds → External directory untouched
2. ✅ Client uploads products → Files go to external directory
3. ✅ You push more code → Client's images still work
4. ✅ Repeat forever → No data loss

**The magic:** External directory is completely independent of your code deployments!

