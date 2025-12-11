# Shipping Options Setup Guide

## Problem
You're getting the error: "No shipping methods are available for your location"

This means shipping options are not configured in your Medusa backend region.

## Solution: Configure Shipping Options

### Step 1: Access Medusa Admin
1. Go to your Medusa Admin panel (usually `http://your-backend-url:9000/app`)
2. Log in with your admin credentials

### Step 2: Navigate to Regions
1. Click on **Settings** in the left sidebar
2. Click on **Regions**
3. Select your region (or create one if you don't have any)

### Step 3: Add Shipping Options
1. In the region settings, find the **Shipping Options** section
2. Click **Add Shipping Option** or **+ Add**
3. Configure your shipping option:
   - **Name**: e.g., "Standard Shipping", "Express Shipping"
   - **Price**: Set the shipping cost (in cents, e.g., 0 for free shipping, 1000 for $10.00)
   - **Service Zone**: Select the countries/regions this option applies to
   - **Fulfillment Provider**: Select your fulfillment provider (or use default)

### Step 4: Configure Fulfillment Provider
If you don't have a fulfillment provider:
1. Go to **Settings** → **Fulfillment Providers**
2. Add a fulfillment provider (e.g., manual fulfillment)
3. Configure it for your region

### Step 5: Test
1. Go back to your storefront
2. Add items to cart
3. Go to checkout
4. Shipping options should now appear

## Quick Setup Example

For a basic setup with free shipping:

1. **Region Settings**:
   - Region Name: "United States"
   - Currency: USD
   - Countries: United States

2. **Shipping Option**:
   - Name: "Standard Shipping"
   - Price: 0 (free shipping)
   - Service Zone: United States
   - Fulfillment Provider: Manual

3. **Save** and test

## Troubleshooting

### No Shipping Options Available
- **Check**: Region has shipping options configured
- **Check**: Shipping options are enabled for the region
- **Check**: Shipping address is complete (country, city, postal code)

### Shipping Methods Not Showing
- **Check**: Shipping address matches the region's countries
- **Check**: Products have shipping profiles assigned
- **Check**: Fulfillment providers are configured

### Error: "Shipping method is required"
- This means physical products require shipping
- You must configure at least one shipping option in the region
- Digital products don't require shipping methods

## Alternative: Use Digital Products

If you don't want to configure shipping:
- Mark products as **digital** in Medusa Admin
- Digital products don't require shipping methods
- Go to Product → Edit → Set as digital product

## References

- [Medusa Shipping Documentation](https://docs.medusajs.com/resources/commerce-modules/fulfillment)
- [Medusa Regions Documentation](https://docs.medusajs.com/resources/regions)

