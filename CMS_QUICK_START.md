# CMS Backend - Quick Start Guide

## ✅ Complete Backend Setup

All CMS backend files have been created. Here's what you have:

### 📁 File Structure

```
backend/
├── src/
│   ├── modules/cms/              # CMS Module
│   │   ├── models/
│   │   │   ├── hero.ts          # Hero Banner model
│   │   │   ├── instruction.ts   # Hero Instruction model
│   │   │   └── faq.ts           # FAQ model
│   │   ├── service.ts            # CMS Service (CRUD)
│   │   └── index.ts             # Module registration
│   │
│   ├── api/
│   │   ├── admin/cms/           # Admin APIs (Protected)
│   │   │   ├── heroes/route.ts
│   │   │   ├── instructions/route.ts
│   │   │   └── faqs/route.ts
│   │   └── store/cms/           # Store API (Public)
│   │       └── route.ts
│   │
│   └── admin/routes/cms/        # Admin Pages
│       ├── page.tsx             # CMS Parent Menu
│       ├── heroes/page.tsx     # Hero Banner Page
│       ├── instructions/page.tsx
│       └── faqs/page.tsx
│
└── medusa-config.ts             # CMS module registered
```

## 🚀 Setup Steps

### 1. Run Database Migration
```bash
cd backend
npx medusa db:migrate
```

This creates the database tables:
- `cms_hero`
- `cms_instruction`
- `cms_faq`

### 2. Build & Start
```bash
yarn build
yarn dev
```

### 3. Access Admin Panel
1. Go to `http://localhost:9000/app`
2. Look for **"CMS"** in the left sidebar menu
3. Click to expand and see:
   - Hero Banner
   - Hero Instruction
   - FAQ

## 📋 Admin Features

Each page (Hero Banner, Instruction, FAQ) has:

✅ **Image Upload** - Click to upload or paste URL
✅ **Title** - Required text field
✅ **Description** - Optional textarea
✅ **Sort Order** - Number field (0, 1, 2, ...)
✅ **Active Toggle** - Enable/disable switch
✅ **List View** - See all items in a table
✅ **Create/Edit/Delete** - Full CRUD operations

## 🌐 API Endpoints

### Admin APIs (Protected - requires auth)
```
GET    /admin/cms/heroes          - List all heroes
POST   /admin/cms/heroes          - Create hero
PUT    /admin/cms/heroes          - Update hero
DELETE /admin/cms/heroes?id=xxx   - Delete hero

Same for /instructions and /faqs
```

### Store API (Public - for frontend)
```
GET /store/cms

Returns:
{
  "heroes": [...],      // Only active heroes
  "instructions": [...], // Only active instructions
  "faqs": [...]         // Only active FAQs
}
```

## 💻 Frontend Usage

```typescript
// Fetch CMS content
const response = await fetch('http://your-backend:9000/store/cms')
const { heroes, instructions, faqs } = await response.json()

// Display heroes
heroes.forEach(hero => {
  console.log(hero.title, hero.image_url, hero.description)
})

// Display FAQs
faqs.forEach(faq => {
  console.log(faq.question, faq.answer)
})
```

## ✅ What's Working

- ✅ CMS module registered
- ✅ Database models defined
- ✅ Service layer with CRUD
- ✅ Admin API routes
- ✅ Store API route (public)
- ✅ Admin pages with menu structure
- ✅ Image upload support
- ✅ Enable/disable toggle
- ✅ Sort order management

## 🎯 Menu Structure

The admin menu will show:
```
CMS (Parent - same level as Products)
 ├─ Hero Banner
 ├─ Hero Instruction
 └─ FAQ
```

All pages are accessible from the CMS parent menu in the admin panel.

