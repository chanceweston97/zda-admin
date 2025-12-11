# Stripe Payment Provider Setup

This guide explains how to set up Stripe payment provider in your Medusa backend.

## Prerequisites

- [Stripe account](https://stripe.com/)
- [Stripe Secret API Key](https://support.stripe.com/questions/locate-api-keys-in-the-dashboard)
- For production: [Stripe webhook secret](https://docs.stripe.com/webhooks#add-a-webhook-endpoint)

## Installation

The Stripe payment provider package is already installed:
```bash
npm install @medusajs/payment-stripe
```

## Configuration

The Stripe payment provider is configured in `medusa-config.ts`. Make sure it looks like this:

```typescript
{
  resolve: "@medusajs/medusa/payment",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/payment-stripe",
        id: "stripe",
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET, // Optional for development
          capture: true, // Automatically capture payment after authorization
          automatic_payment_methods: true, // Enable Apple Pay, Google Pay, etc.
        },
      },
    ],
  },
}
```

## Environment Variables

Add the following to your `backend/.env` file:

```env
# Stripe API Key (Secret Key from Stripe Dashboard)
STRIPE_API_KEY=sk_test_your_secret_key_here

# Stripe Webhook Secret (for production only)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important:**
- Use `sk_test_...` for development/test mode
- Use `sk_live_...` for production
- Never commit your `.env` file to version control

## Enable Stripe in a Region

After configuring the backend, you must enable Stripe in your region:

1. Log in to Medusa Admin dashboard
2. Navigate to **Settings** → **Regions**
3. Select the region where you want to enable Stripe
4. Click the edit icon and choose "Edit"
5. In the "Payment Providers" field, select **"Stripe"** (or `pp_stripe_stripe`)
6. Click "Save"

## Webhook Setup (Production Only)

For production applications, set up Stripe webhooks:

### Webhook URL

```
https://your-medusa-server.com/hooks/payment/stripe_stripe
```

Replace `your-medusa-server.com` with your actual server URL.

### Webhook Events

Select these events in Stripe Dashboard:
- `payment_intent.amount_capturable_updated`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.partially_funded` (if applicable)

## Payment Provider IDs

When registered with ID `stripe`, the following providers are available:

| Provider Name | Provider ID |
|---|---|
| Basic Stripe Payment | `pp_stripe_stripe` |
| Bancontact Payments | `pp_stripe-bancontact_stripe` |
| BLIK Payments | `pp_stripe-blik_stripe` |
| giropay Payments | `pp_stripe-giropay_stripe` |
| iDEAL Payments | `pp_stripe-ideal_stripe` |
| Przelewy24 Payments | `pp_stripe-przelewy24_stripe` |
| PromptPay Payments | `pp_stripe-promptpay_stripe` |
| OXXO Payments | `pp_stripe-oxxo_stripe` |

## Testing

1. Restart your Medusa backend server
2. Verify Stripe is enabled in your region (Admin → Settings → Regions)
3. Test checkout with Stripe test card: `4242 4242 4242 4242`

## Troubleshooting

- **Stripe not showing in checkout**: Make sure it's enabled in the region settings
- **Payment fails**: Check that `STRIPE_API_KEY` is set correctly in `.env`
- **Webhook errors**: Verify webhook URL and events are configured correctly

## References

- [Medusa Stripe Documentation](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe)
- [Stripe API Keys](https://support.stripe.com/questions/locate-api-keys-in-the-dashboard)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)

