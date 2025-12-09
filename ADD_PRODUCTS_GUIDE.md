# Adding Products to Medusa

## Quick Fix: Add Products via Admin Panel

The easiest way to add products is through the Medusa Admin panel:

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open Medusa Admin:**
   - Go to `http://localhost:9000/app`
   - Login with your admin credentials

3. **Create Categories:**
   - Go to **Products > Categories**
   - Create these categories:
     - **Antennas** (handle: `antennas`)
     - **Cables** (handle: `cables`)
     - **Connectors** (handle: `connectors`)

4. **Create Products:**
   - Go to **Products > Products**
   - Click **"New Product"**
   - Fill in:
     - **Title**: e.g., "Yagi Directional Antenna 6dBi"
     - **Handle**: e.g., "yagi-directional-antenna-6dbi" (auto-generated from title)
     - **Subtitle**: Optional description
     - **Description**: Product description
   - In **Organize** sidebar:
     - Select a **Category** (e.g., "Antennas")
   - In **Custom Product Fields** widget:
     - Select **Product Type** (e.g., "Antenna")
     - If Antenna: Fill in Features, Applications, Specifications, and upload Datasheet Image/PDF
   - Click **"Save"**

5. **Add Variants:**
   - After saving, go to **Variants** tab
   - Click **"Add Variant"**
   - Fill in:
     - **Title**: e.g., "6dBi" (for antennas) or "10 ft" (for cables)
     - **SKU**: e.g., "ANT-YAGI-6DBI"
     - **Price**: e.g., 89.99
     - **Inventory**: e.g., 50
   - Click **"Save"**

6. **Publish Product:**
   - Make sure product status is **"Published"** (not "Draft")
   - Products must be published to show on the store page

## Alternative: Use Script (Advanced)

If you prefer to use the script:

1. **Create an Admin API Token:**
   - In Medusa Admin: **Settings > API Token Management**
   - Click **"Create Token"**
   - Copy the token

2. **Set environment variable:**
   ```bash
   export MEDUSA_ADMIN_API_KEY=your_token_here
   ```

3. **Install tsx (if not already installed):**
   ```bash
   npm install -D tsx
   ```

4. **Run the script:**
   ```bash
   cd backend
   npx tsx scripts/create-sample-products.ts
   ```

## Troubleshooting

### Products not showing on store page?

1. **Check product status:**
   - Products must be **"Published"** (not "Draft")
   - Go to Products > Products and check the status column

2. **Check if products have variants:**
   - Products without variants won't show
   - Make sure each product has at least one variant with a price

3. **Check region setup:**
   - Make sure you have at least one region configured
   - Go to **Settings > Regions** in Admin panel
   - Products need to be available in a region

4. **Check categories:**
   - Products should be assigned to a category
   - Categories should be published

5. **Clear cache and restart:**
   ```bash
   # Stop the server (Ctrl+C)
   # Restart
   npm run dev
   ```

### File Upload Not Working?

The file upload issue has been fixed. If you still see errors:

1. **Check browser console** for detailed error messages
2. **Check backend logs** for upload errors
3. **Verify file size** - large files may timeout
4. **Try a different file format** - ensure it's a valid image or PDF

The upload now handles different response formats from Medusa and provides better error messages.

