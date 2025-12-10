# Backend API Diagnostics - Products Not Returning

## Quick Test

When your backend is running, test the API directly:

```bash
# In backend directory
node test-store-api.js
```

This will test:
1. Regions endpoint
2. Products endpoint (basic)
3. Products endpoint (with fields)
4. Admin API (to see all products including drafts)

## Common Issues

### 1. Products Not Published
**Symptom:** Store API returns 0 products, but Admin API shows products

**Solution:**
- Go to Medusa Admin → Products
- Open each product
- Change status from "Draft" to "Published"
- Save

### 2. Products Not Linked to Sales Channel
**Symptom:** Products are published but still don't show

**Solution:**
- Go to Medusa Admin → Settings → Sales Channels
- Make sure you have a sales channel (e.g., "Default Store")
- Go to Products → Edit product → Organize tab
- Make sure the product is assigned to the sales channel
- The publishable API key must also be linked to the same sales channel

### 3. Products Have No Variants
**Symptom:** Products exist but store API returns 0

**Solution:**
- Products MUST have at least one variant
- Go to Products → Edit product → Variants tab
- Create at least one variant
- Set a price for the variant

### 4. Variants Have No Prices
**Symptom:** Products have variants but don't show

**Solution:**
- Go to Products → Edit product → Variants tab
- Click on a variant
- Set a price in the region's currency
- Save

### 5. Publishable Key Not Linked to Sales Channel
**Symptom:** API returns 400 or 0 products

**Solution:**
- Go to Medusa Admin → Settings → API Keys
- Find your publishable key
- Click to edit it
- Make sure it's linked to at least one Sales Channel
- The sales channel must match where your products are assigned

## Testing the API

### Using curl:
```bash
# Get regions
curl -H "x-publishable-api-key: YOUR_KEY" http://localhost:9000/store/regions

# Get products
curl -H "x-publishable-api-key: YOUR_KEY" "http://localhost:9000/store/products?region_id=REGION_ID&limit=10"
```

### Using the test script:
```bash
cd backend
# Set the publishable key
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your-key-here
# Or it will read from front/.env.local automatically
node test-store-api.js
```

## Expected Response

A successful products API call should return:
```json
{
  "products": [
    {
      "id": "prod_...",
      "title": "Product Name",
      "status": "published",
      "variants": [...],
      "metadata": {...}
    }
  ],
  "count": 5
}
```

If `count` is 0 or `products` is empty, check the issues above.

## Debug Checklist

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Backend is accessible at `http://localhost:9000`
- [ ] Publishable API key is set in frontend `.env.local`
- [ ] Publishable API key exists in Medusa Admin
- [ ] Publishable API key is linked to a Sales Channel
- [ ] Products exist in Medusa Admin
- [ ] Products are set to "Published" status
- [ ] Products are assigned to a Sales Channel
- [ ] Products have at least one variant
- [ ] Variants have prices set
- [ ] Region exists and is configured
- [ ] Products are available in the region

## Next Steps

1. Start the backend: `cd backend && npm run dev`
2. Run the test script: `node test-store-api.js`
3. Check the output to see which test fails
4. Fix the issue based on the error message
5. Re-run the test to verify



