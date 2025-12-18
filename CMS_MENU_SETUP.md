# CMS Menu Navigation Setup

## ✅ Routes Are Configured

All CMS routes have been created with proper config:

- ✅ `src/admin/routes/cms/page.tsx` - Parent menu
- ✅ `src/admin/routes/cms/heroes/page.tsx` - Hero Banner (child)
- ✅ `src/admin/routes/cms/instructions/page.tsx` - Hero Instruction (child)
- ✅ `src/admin/routes/cms/faqs/page.tsx` - FAQ (child)

## 🔧 How It Works

In Medusa v2, routes in `src/admin/routes/` **automatically** appear in the navigation menu when they have:

1. ✅ Correct folder structure
2. ✅ `export const config` with `label` and `icon`
3. ✅ Proper `path` property

## 📋 Current Config

**Parent (CMS):**
```typescript
export const config = {
  label: "CMS",
  icon: "DocumentText",
  path: "/cms",
}
```

**Children (Hero Banner, etc.):**
```typescript
export const config = {
  label: "Hero Banner",
  icon: "Photo",
  path: "/cms/heroes",
  parent: "CMS",
}
```

## 🚀 To Make Menu Appear

The routes should automatically appear in the menu after:

1. **Rebuild admin:**
   ```bash
   yarn build
   ```

2. **Restart server:**
   ```bash
   yarn dev
   # or
   pm2 restart medusa-backend
   ```

3. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)

## 📍 Expected Result

After rebuild, the admin sidebar should show:

```
CMS (clickable, expands to show children)
 ├─ Hero Banner
 ├─ Hero Instruction
 └─ FAQ
```

## ⚠️ Troubleshooting

If menu doesn't appear after rebuild:

1. **Check admin build logs** - Look for errors
2. **Verify file locations** - All `page.tsx` files must be in correct folders
3. **Check config exports** - Each file must have `export const config`
4. **Clear .medusa cache:**
   ```bash
   rm -rf .medusa/admin
   yarn build
   ```

## ✅ Routes Are Working

Since you can access `/app/cms`, the routes are correctly registered. The menu should appear automatically - it's just a matter of the admin build picking up the new routes.

The folder structure `routes/cms/` creates the parent, and `routes/cms/heroes/` creates the child automatically in Medusa v2.

