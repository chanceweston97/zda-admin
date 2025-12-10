# Complete Guide: Setting Prices in Medusa Admin

## ⚠️ IMPORTANT: Prices are on VARIANTS, not Products!

In Medusa, **products don't have prices**. Each **variant** of a product has prices.

## Step-by-Step Instructions

### Step 1: Open Medusa Admin
1. Go to `http://localhost:9000/app`
2. Log in if needed

### Step 2: Navigate to Products
1. Click **"Products"** in the left sidebar
2. You'll see a list of all products

### Step 3: Open a Product
1. Click on any product from the list
2. This opens the product edit page

### Step 4: Find the Variants Section
Look for one of these:
- **"Variants"** tab at the top of the page
- **"Variants"** section in the sidebar
- A section showing variant options (Size, Color, etc.)

### Step 5: Edit a Variant
1. You'll see a list of variants (e.g., "S / Black", "M / White")
2. Click on a variant to edit it
   - Or click the **"Edit"** button/icon next to the variant
   - Or click the variant row

### Step 6: Set Prices
Once in the variant edit page:

1. Look for **"Prices"** or **"Pricing"** section
2. You'll see a list of currencies (USD, EUR, etc.)
3. For each currency, enter the price amount
4. **CRITICAL:** Enter amount in **cents** (smallest currency unit):
   - For **$15.00 USD**: Enter `1500`
   - For **$10.00 USD**: Enter `1000`
   - For **€20.00 EUR**: Enter `2000`
5. Click **"Save"** or **"Update"**

### Step 7: Repeat for All Variants
- Go back to the variants list
- Edit each variant that doesn't have prices
- Set prices for each one

## Visual Guide (What to Look For)

```
Medusa Admin → Products → [Product Name]
│
├── General Tab
│   ├── Title
│   ├── Description
│   └── ...
│
├── Variants Tab  ← CLICK HERE!
│   ├── Variant 1: "S / Black"
│   │   └── [Edit] → Prices Section → Enter: 1500 (for $15.00)
│   │
│   ├── Variant 2: "S / White"
│   │   └── [Edit] → Prices Section → Enter: 1500 (for $15.00)
│   │
│   └── Variant 3: "M / Black"
│       └── [Edit] → Prices Section → Enter: 1500 (for $15.00)
│
└── Organize Tab
    └── Categories, Sales Channels, etc.
```

## Common Locations for Prices Section

The "Prices" section might be:
- At the top of the variant edit form
- In a collapsible section (click to expand)
- In a "Pricing" tab within the variant editor
- Below other variant fields (scroll down)

## Price Format Examples

| Display Price | Enter in Admin (cents) |
|--------------|----------------------|
| $10.00       | 1000                 |
| $15.00       | 1500                 |
| $25.50       | 2550                 |
| $100.00      | 10000                |
| €20.00       | 2000                 |

## Quick Check Script

When your backend is running, use this to check which products need prices:

```bash
cd backend
node check-product-prices.js
```

This will show:
- Which products have prices ✅
- Which products are missing prices ❌
- Which variants need prices

## Troubleshooting

### "I can't find the Prices section"
- Make sure you're editing a **variant**, not the product
- Look for "Pricing", "Prices", or currency codes (USD, EUR)
- Try expanding all collapsible sections
- Check if there's a "Pricing" tab in the variant editor

### "Prices are set but not showing"
- Verify the currency matches your region's currency
- Check that the product is **Published** (not Draft)
- Ensure the product is assigned to a **Sales Channel**
- Verify the **publishable API key** is linked to the sales channel

### "I set prices but they're wrong"
- Remember: amounts are in **cents**
- $15.00 = 1500 (not 15)
- Check which currency you're setting (USD vs EUR)

## Alternative: Bulk Price Update

If you have many variants:
1. Some admin panels allow bulk editing
2. Or use the API/scripts to set prices programmatically
3. Or edit variants one by one (tedious but works)

## After Setting Prices

1. **Save** the variant
2. **Publish** the product (if not already published)
3. **Verify** on the storefront that prices appear
4. Run `node check-product-prices.js` to verify all prices are set

## Need Help?

If you still can't find where to set prices:
1. Take a screenshot of the variant edit page
2. Check the Medusa documentation: https://docs.medusajs.com
3. The prices section should be visible when editing a variant



