# How to Set Prices for Products in Medusa Admin

## Important: Prices are set on VARIANTS, not Products!

In Medusa, products don't have prices directly. Each **variant** of a product has prices.

## Step-by-Step Guide

### 1. Navigate to Products
- Go to Medusa Admin: `http://localhost:9000/app`
- Click **Products** in the sidebar

### 2. Open a Product
- Click on any product to edit it
- You'll see the product details page

### 3. Go to Variants Tab
- Look for the **Variants** tab (usually at the top or in a sidebar)
- Click on it to see all variants for this product

### 4. Edit a Variant
- Click on a variant to edit it
- Or click the "Edit" button next to a variant

### 5. Set Prices
- In the variant edit page, look for **"Prices"** section
- You'll see a list of currencies (e.g., USD, EUR)
- For each currency, enter the price amount
- **Important:** Enter the price in the smallest currency unit:
  - For USD: Enter in **cents** (e.g., 1500 = $15.00)
  - For EUR: Enter in **cents** (e.g., 1000 = €10.00)
- Click **Save** or **Update**

### 6. Verify Prices
- After saving, the prices should appear in the variant list
- Make sure prices are set for the currency of your region

## Example

If you want to set a price of **$15.00 USD**:
1. Find the variant
2. In the Prices section, find "USD"
3. Enter: **1500** (this is 1500 cents = $15.00)
4. Save

## Common Issues

### Issue: "No prices" or prices not showing
**Solution:**
- Make sure you're editing the **variant**, not the product
- Make sure the currency matches your region's currency
- Make sure you entered the amount in cents (smallest unit)

### Issue: Can't find the Prices section
**Solution:**
- Make sure you're in the variant edit page (not product edit)
- Look for "Pricing" or "Prices" in the variant form
- It might be in a collapsible section - expand all sections

### Issue: Prices set but not showing on storefront
**Solution:**
- Make sure the variant has prices for the region's currency
- Check that the product is published
- Check that the product is assigned to a sales channel
- Verify the publishable API key is linked to the sales channel

## Quick Check

To verify prices are set correctly:
1. Go to Products → Edit product → Variants tab
2. Check each variant - it should show prices
3. If a variant shows "No prices", click Edit and add prices

## Alternative: Bulk Price Update

If you have many variants, you might be able to:
1. Select multiple variants
2. Use bulk actions to set prices
3. Or use the API/scripts to set prices programmatically

## Notes

- Prices must be set for each variant individually
- Each variant can have different prices
- Prices are currency-specific (USD, EUR, etc.)
- Amounts are stored in the smallest currency unit (cents)
- The store API will automatically convert and display prices correctly



