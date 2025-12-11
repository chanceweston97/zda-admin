# Email Notification Troubleshooting Guide

## Issue: No Email Received After Order Confirmation

If you're not receiving emails when orders are placed, follow these steps:

### Step 1: Check Environment Variables

Make sure these environment variables are set in your `backend/.env` file:

```env
# Email Server Configuration
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=your-email@yourdomain.com

# Admin Email (where notifications will be sent)
ADMIN_EMAIL=admin@yourdomain.com
```

### Step 2: Check Backend Logs

When an order is placed, you should see logs like:

```
📧 Order created subscriber triggered: { orderId: '...' }
📦 Order created: order_xxx (12345)
📧 Preparing to send email to admin: admin@yourdomain.com
📧 Email configuration: { ... }
📧 Sending email...
✅ Order notification email sent successfully to admin: admin@yourdomain.com
```

**If you see warnings:**
- `⚠️ ADMIN_EMAIL not configured` → Set `ADMIN_EMAIL` in `.env`
- `❌ Email server credentials not configured!` → Set `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD` in `.env`

### Step 3: Verify Subscriber is Registered

The subscriber should be automatically discovered by Medusa. Check if the file exists:
- `backend/src/subscribers/order-created.ts`

Medusa automatically loads all subscribers from the `src/subscribers` directory.

### Step 4: Test Email Configuration

You can test your email configuration by checking the backend logs when placing an order. The subscriber will log:
- Whether it's triggered
- Email configuration status
- Any errors during sending

### Step 5: Common Issues

#### Issue: "SMTP connection failed"
**Solution:**
- Check your email server host and port
- Verify your email credentials are correct
- For PrivateEmail.com, use port 587 (TLS) or 465 (SSL)
- Make sure `EMAIL_SERVER_PORT=465` if using SSL

#### Issue: "Email was rejected"
**Solution:**
- Ensure `EMAIL_FROM` matches `EMAIL_SERVER_USER` (required by PrivateEmail.com)
- Check spam folder
- Verify the recipient email address is valid

#### Issue: "Subscriber not triggered"
**Solution:**
- Restart your Medusa backend after adding the subscriber
- Check that the order was actually created (check Medusa Admin)
- Verify the subscriber file is in `backend/src/subscribers/`

### Step 6: Manual Email Test

To test email sending manually, you can create a test script:

```typescript
// backend/test-email.ts
import { sendEmail } from "./src/lib/email";

async function testEmail() {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: "Test Email",
      html: "<p>This is a test email from Medusa.</p>",
    });
    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ Test email failed:", error);
  }
}

testEmail();
```

Run with: `npx tsx backend/test-email.ts`

### Step 7: Check Email Provider Settings

For PrivateEmail.com:
- Make sure SMTP is enabled in your account
- Use the correct SMTP server: `mail.privateemail.com`
- Port 587 for TLS (STARTTLS)
- Port 465 for SSL
- Use your full email address as the username

### Still Not Working?

1. **Check backend console logs** when placing an order
2. **Verify environment variables** are loaded (restart backend after changing `.env`)
3. **Check email provider** settings and credentials
4. **Test with a simple email** using the test script above

### Debug Mode

The subscriber now includes detailed logging. Check your backend console for:
- Subscriber trigger confirmation
- Email configuration details
- SMTP connection status
- Email send results

