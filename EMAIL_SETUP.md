# Email Notification Setup

This guide explains how to configure email notifications for order creation in your Medusa backend.

## Overview

When an order is placed (either via Cash on Delivery or Stripe payment), an email notification is automatically sent to the admin email address with complete order details.

## Environment Variables

Add the following environment variables to your `backend/.env` file:

```env
# Email Server Configuration (PrivateEmail.com)
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=your-email@yourdomain.com  # Optional, defaults to EMAIL_SERVER_USER

# Admin Email (recipient of order notifications)
ADMIN_EMAIL=admin@yourdomain.com
```

### PrivateEmail.com Configuration

- **Host**: `mail.privateemail.com`
- **Port 587**: TLS (STARTTLS) - Recommended
- **Port 465**: SSL - Use if 587 doesn't work
- **Username**: Your full email address (e.g., `noreply@yourdomain.com`)
- **Password**: Your email account password

### Important Notes

1. **EMAIL_FROM** should match **EMAIL_SERVER_USER** for PrivateEmail.com to work properly
2. If **EMAIL_FROM** is different, PrivateEmail.com may reject the emails
3. **ADMIN_EMAIL** is where order notifications will be sent

## How It Works

1. **Order Created Event**: When a customer places an order, Medusa emits an `order.created` event
2. **Subscriber Listens**: The `order-created.ts` subscriber listens to this event
3. **Email Sent**: An HTML email with order details is sent to the admin email address

## Email Content

The email includes:
- Order ID and Order Number
- Order date and time
- Customer email
- Payment status
- Total amount
- Complete list of order items with quantities and prices
- Shipping address
- Billing address (if different)
- Link to view order in admin panel

## Testing

1. Place a test order through your storefront
2. Check the backend logs for email sending confirmation
3. Verify the email was received at the admin email address

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables**: Ensure all email variables are set correctly
2. **Check Logs**: Look for email-related errors in the backend console
3. **Verify SMTP Connection**: The system will log SMTP connection status
4. **Check Spam Folder**: Admin emails might be in spam

### Common Errors

- **"Email server credentials are not configured"**: Set `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD`
- **"SMTP connection failed"**: Check your email server credentials and port settings
- **"ADMIN_EMAIL not configured"**: Set `ADMIN_EMAIL` in your `.env` file

## Files

- `backend/src/lib/email.ts` - Email utility using nodemailer
- `backend/src/subscribers/order-created.ts` - Subscriber that sends emails on order creation

## Restart Required

After adding or updating environment variables, restart your Medusa backend:

```bash
npm run dev
```

