# Admin Email Notifications for Orders

When a customer places an order, the system automatically sends an email notification to admin email addresses with complete order details, including custom cable specifications.

## Configuration

### Environment Variable

Add to your `backend/.env` file:

```env
ADMIN_EMAILS=admin@example.com,admin2@example.com,admin3@example.com
```

**Notes:**
- Supports multiple emails separated by commas
- All listed emails will receive the notification
- Falls back to `ADMIN_EMAIL` if `ADMIN_EMAILS` is not set (for backwards compatibility)

### Required Email Configuration

The email system uses the existing email configuration:

```env
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=your-email@yourdomain.com
```

## Email Content

The notification email includes:

### Order Information
- Order ID and Order Number
- Order Date
- Customer Email
- Payment Status
- Total Amount

### Order Items with Custom Details
- Product name (uses custom title for custom cables)
- Quantity
- Unit price (uses custom price for custom cables)
- Total price
- **Custom Cable Details** (if applicable):
  - Custom cable title
  - Description
  - Summary
  - Number of cables

### Custom Cable Highlighting
- Special highlighted section if order contains custom cables
- Custom cable summary
- Total custom cable price

### Addresses
- Shipping Address
- Billing Address

### Quick Links
- Direct link to view order in Medusa Admin panel

## How It Works

1. Customer completes checkout
2. Order is created in Medusa
3. `order.created` event is triggered
4. `order-created.ts` subscriber catches the event
5. Email is sent to all addresses in `ADMIN_EMAILS`

## Testing

To test the email notification:

1. Place a test order through your storefront
2. Check admin email inboxes
3. Verify email contains all order details
4. Check that custom cable details are displayed correctly

## Troubleshooting

### Emails Not Sending

**Check logs:**
```bash
# Look for email-related logs in your backend console
# You should see messages like:
# 📧 Order created subscriber triggered
# 📧 Preparing to send email to admin(s)
# ✅ Order notification email sent successfully
```

**Common issues:**

1. **ADMIN_EMAILS not set**
   - Solution: Add `ADMIN_EMAILS=your-email@example.com` to `.env`

2. **Email server credentials not configured**
   - Solution: Set `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD`

3. **SMTP connection fails**
   - Check `EMAIL_SERVER_HOST` and `EMAIL_SERVER_PORT`
   - Verify credentials are correct
   - Check firewall/network settings

4. **Emails going to spam**
   - Check SPF/DKIM records for your domain
   - Verify `EMAIL_FROM` matches your domain

### Custom Cable Details Not Showing

- Verify order items have metadata with `isCustomCable: true`
- Check that `customTitle` and `unitCustomCablePriceDollars` are in metadata
- Ensure metadata is being stored during checkout

## File Location

- Subscriber: `backend/src/subscribers/order-created.ts`
- Email utility: `backend/src/lib/email.ts`

## Customization

To customize the email template, edit the `formatOrderEmail` function in `backend/src/subscribers/order-created.ts`.

The email uses HTML formatting with inline CSS for better email client compatibility.

