# File Upload Fix for Medusa Admin Widgets

## Issue
Getting "Unauthorized" error when uploading datasheet images/PDFs in the Custom Product Fields widget.

## Root Cause
The upload endpoint requires proper authentication. In Medusa v2, file uploads need:
1. Proper authentication (cookies/tokens)
2. File service configuration (optional, but recommended)

## Solution

### Option 1: Check File Service Configuration (Recommended)

Medusa v2 has a built-in file service, but you may need to configure it. Check your `medusa-config.ts`:

```typescript
module.exports = defineConfig({
  projectConfig: {
    // ... existing config
  },
  // Add file service configuration if needed
  // Medusa v2 has a default file service, but you can configure it
})
```

### Option 2: Verify Authentication

The widget uses `credentials: "include"` to send cookies. Make sure:
1. You're logged into the admin panel
2. The admin session is valid
3. Cookies are being sent (check browser DevTools > Network tab)

### Option 3: Use Alternative Upload Method

If the direct fetch doesn't work, you can:

1. **Upload via Product Images first, then copy URL:**
   - Use the built-in product image upload in the main form
   - Copy the image URL
   - Paste it into the datasheet fields

2. **Use external file hosting:**
   - Upload files to a service like Cloudinary, AWS S3, etc.
   - Paste the URL into the datasheet fields

### Option 4: Check Endpoint

Verify the upload endpoint exists:
- Open browser DevTools > Network tab
- Try uploading a product image (which works)
- Check the request URL and headers
- Compare with our widget's upload request

### Debugging Steps

1. **Check browser console:**
   - Look for the "Upload response:" log
   - Check for any CORS or authentication errors

2. **Check Network tab:**
   - Open DevTools > Network
   - Try uploading a file
   - Check the request:
     - URL: Should be `/admin/uploads` or full URL
     - Method: POST
     - Headers: Should include cookies
     - Status: Check if it's 401 (Unauthorized) or 404 (Not Found)

3. **Check backend logs:**
   - Look for upload-related errors
   - Check if file service is configured

### Temporary Workaround

Until the upload is fixed, you can:
1. Upload images/PDFs to a file hosting service
2. Copy the public URL
3. Manually enter the URL in the metadata (you can edit metadata directly if needed)

### Testing

To test if uploads work:
1. Try uploading a product image in the main product form
2. If that works, the issue is specific to our widget
3. If that doesn't work, the issue is with Medusa's file service configuration

## Next Steps

1. Check if product image uploads work in the main form
2. Compare the working upload request with our widget's request
3. Update the widget to match the working request format
4. If needed, configure file service in `medusa-config.ts`

