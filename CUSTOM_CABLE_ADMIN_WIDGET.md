# Custom Cable Admin Widget

This widget enhances the Medusa Admin panel to display custom cable metadata prominently in order line items.

## What It Does

When viewing an order in Medusa Admin:
- ✅ Detects line items with custom cable metadata
- ✅ Displays custom title, price, and description prominently
- ✅ Shows detailed cable specifications
- ✅ Replaces or augments the default "Custom Product - $100" display

## Files Created

- `backend/src/admin/widgets/order-custom-cable-display.tsx` - Main widget component

## How It Works

1. **Widget Injection**: The widget is injected into the `order.details.after` zone in Medusa Admin
2. **Order Detection**: Reads the order ID from the URL
3. **Metadata Reading**: Fetches order data and identifies items with custom cable metadata
4. **Display Enhancement**: Shows custom details in a prominent widget section

## Installation

The widget is automatically loaded when you:
1. Restart your Medusa backend server
2. Refresh the admin panel

No additional configuration needed - just rebuild the backend:

```bash
cd backend
yarn build
yarn dev
```

## What You'll See

### Before (Default Medusa Display):
- Line Item: "Custom Product" - $100.00
- (Custom details hidden in metadata)

### After (With Widget):
- **📦 Custom Cable Order (1 item)**
  - **Custom Cable - N-Male to N-Male (10ft, LMR 400)**
  - Price: **$32.94**
  - Description: LMR 400: N-Male to N-Male, 10ft
  - Summary: N-Male to N-Male (10ft, LMR 400) x1 - $32.94

## Widget Zones

The widget uses:
- `order.details.after` - Displays summary widget after order details
- DOM enhancement - Also enhances the items table inline

## Metadata Fields Used

The widget looks for these metadata fields on line items:
- `isCustomCable` - Boolean flag
- `customTitle` - Display title
- `customDescription` - Display description  
- `unitCustomCablePriceDollars` - Price to display
- `customCables` - JSON array of individual cables
- `summary` - Summary text

## Troubleshooting

If the widget doesn't appear:
1. Check that the backend is rebuilt: `yarn build` in backend folder
2. Clear browser cache and refresh admin panel
3. Check browser console for errors
4. Verify order has metadata with `isCustomCable: true`

## Future Enhancements

Possible improvements:
- [ ] Edit custom cable details from admin
- [ ] Export custom cable specs to PDF
- [ ] Bulk order management for custom cables
- [ ] Custom cable templates/saved configurations

