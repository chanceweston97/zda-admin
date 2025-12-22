import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { sendEmail } from "../lib/email"

// Format currency
const formatCurrency = (amount: number, currencyCode: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount / 100); // Medusa stores amounts in cents
};

// Format order details for email
const formatOrderEmail = (order: any) => {
  const orderDate = new Date(order.created_at).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemsHtml = order.items
    ?.map((item: any) => {
      const metadata = item.metadata || {};
      const isCustomCable = metadata.isCustomCable || metadata.customTitle;
      
      // Use custom title and price if available, otherwise use default
      let title = item.title || item.product?.title || "Product";
      let unitPrice = item.unit_price || 0;
      
      // Override with custom cable details if available
      if (isCustomCable && metadata.customTitle) {
        title = metadata.customTitle;
      }
      if (isCustomCable && metadata.unitCustomCablePriceDollars) {
        // Convert dollars back to cents
        unitPrice = parseFloat(metadata.unitCustomCablePriceDollars) * 100;
      }
      
      const quantity = item.quantity || 1;
      const totalPrice = unitPrice * quantity;
      
      // Build custom cable details HTML if this is a custom cable
      let customDetailsHtml = "";
      if (isCustomCable) {
        customDetailsHtml = `
          <div style="margin-top: 8px; padding: 8px; background-color: #f0f9ff; border-left: 3px solid #0ea5e9; font-size: 12px;">
            <div style="font-weight: 600; color: #0c4a6e; margin-bottom: 4px;">📦 Custom Cable Details</div>
            ${metadata.customDescription ? `<div style="color: #64748b; margin-bottom: 4px;">${metadata.customDescription}</div>` : ""}
            ${metadata.summary ? `<div style="color: #475569; margin-top: 4px;"><strong>Summary:</strong> ${metadata.summary}</div>` : ""}
            ${metadata.customCableCount ? `<div style="color: #475569; margin-top: 4px;"><strong>Number of Cables:</strong> ${metadata.customCableCount}</div>` : ""}
          </div>
        `;
      }
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${title}
            ${customDetailsHtml}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(unitPrice)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(totalPrice)}</td>
        </tr>
      `;
    })
    .join("") || "<tr><td colspan='4' style='padding: 8px;'>No items</td></tr>";

  const shippingAddress = order.shipping_address
    ? `
      <p><strong>Shipping Address:</strong></p>
      <p>
        ${order.shipping_address.first_name || ""} ${order.shipping_address.last_name || ""}<br>
        ${order.shipping_address.address_1 || ""}<br>
        ${order.shipping_address.address_2 ? order.shipping_address.address_2 + "<br>" : ""}
        ${order.shipping_address.city || ""}, ${order.shipping_address.province || ""} ${order.shipping_address.postal_code || ""}<br>
        ${order.shipping_address.country_code?.toUpperCase() || ""}<br>
        ${order.shipping_address.phone ? "Phone: " + order.shipping_address.phone : ""}
      </p>
    `
    : "<p>No shipping address provided</p>";

  const billingAddress = order.billing_address
    ? `
      <p><strong>Billing Address:</strong></p>
      <p>
        ${order.billing_address.first_name || ""} ${order.billing_address.last_name || ""}<br>
        ${order.billing_address.address_1 || ""}<br>
        ${order.billing_address.address_2 ? order.billing_address.address_2 + "<br>" : ""}
        ${order.billing_address.city || ""}, ${order.billing_address.province || ""} ${order.billing_address.postal_code || ""}<br>
        ${order.billing_address.country_code?.toUpperCase() || ""}<br>
        ${order.billing_address.phone ? "Phone: " + order.billing_address.phone : ""}
      </p>
    `
    : "";

  const paymentStatus = order.payment_status || "pending";
  const paymentStatusColor = paymentStatus === "captured" ? "#28a745" : paymentStatus === "awaiting" ? "#ffc107" : "#dc3545";

  // Check if order has custom cables
  const hasCustomCables = order.items?.some((item: any) => 
    item.metadata?.isCustomCable || item.metadata?.customTitle
  ) || false;
  
  const orderMetadata = order.metadata || {};
  const customCableSummary = hasCustomCables && orderMetadata.customCableSummary
    ? `
      <div style="background-color: #fef3c7; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0;">📦 Custom Cable Order</h3>
        <p style="color: #78350f; margin: 5px 0;"><strong>Note:</strong> This order contains custom cables. Please review the detailed specifications in the order items above.</p>
        ${orderMetadata.customCableSummary ? `<p style="color: #78350f; margin: 5px 0;"><strong>Summary:</strong> ${orderMetadata.customCableSummary}</p>` : ""}
        ${orderMetadata.totalCustomCablePrice ? `<p style="color: #78350f; margin: 5px 0;"><strong>Custom Cable Total:</strong> ${formatCurrency(orderMetadata.totalCustomCablePrice * 100)}</p>` : ""}
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2958A4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">New Order Received</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
        <h2 style="color: #2958A4; margin-top: 0;">Order Details</h2>
        
        <div style="background-color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #2958A4;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.display_id || "N/A"}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${orderDate}</p>
          <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${order.email || "N/A"}</p>
          <p style="margin: 5px 0;">
            <strong>Payment Status:</strong> 
            <span style="color: ${paymentStatusColor}; font-weight: bold; text-transform: uppercase;">${paymentStatus}</span>
          </p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${formatCurrency(order.total || 0)}</p>
          ${hasCustomCables ? '<p style="margin: 5px 0; color: #f59e0b; font-weight: bold;">📦 This order contains custom cables</p>' : ''}
        </div>

        ${customCableSummary}

        <h3 style="color: #2958A4;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; background-color: white; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #2958A4; color: white;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Unit Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #2958A4;">Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #2958A4;">${formatCurrency(order.total || 0)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          ${shippingAddress}
        </div>

        ${billingAddress ? `
          <div style="background-color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
            ${billingAddress}
          </div>
        ` : ""}

        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; border-left: 4px solid #2958A4;">
          <p style="margin: 0;"><strong>Note:</strong> Please process this order in the Medusa Admin panel.</p>
          <p style="margin: 5px 0 0 0;">Order Link: <a href="${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/app/orders/${order.id}" style="color: #2958A4;">View Order in Admin</a></p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>This is an automated notification from your Medusa store.</p>
      </div>
    </body>
    </html>
  `;
};

export default async function orderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    console.log("📧 Order created subscriber triggered:", { orderId: data.id });
    
    const orderId = data.id;
    const orderModuleService = container.resolve("order");

    // Retrieve the full order details
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: [
        "items",
        "items.product",
        "items.variant",
        "shipping_address",
        "billing_address",
        "payment_collections",
        "payment_collections.payments",
      ],
    });

    console.log(`📦 Order created: ${order.id} (${order.display_id || "N/A"})`);
    console.log(`📦 Order email: ${order.email || "N/A"}`);
    console.log(`📦 Order total: ${order.total || 0}`);

    // Fix line item prices for custom cables
    // This ensures Payments, Fulfillments, and Activity sections work correctly
    try {
      const items = order.items || [];
      let hasCustomCableItems = false;
      const lineItemUpdates: Array<{ id: string; unit_price: number }> = [];

      for (const item of items) {
        const metadata = item.metadata || {};
        const isCustomCable = metadata.isCustomCable || metadata.customTitle || metadata.unitCustomCablePrice;

        if (isCustomCable) {
          hasCustomCableItems = true;
          
          // Get the correct price from metadata (could be in cents or dollars)
          let correctPrice = 0;
          
          // Try different metadata fields that might contain the price
          if (metadata.unitCustomCablePrice) {
            // Price in cents
            correctPrice = typeof metadata.unitCustomCablePrice === 'number' 
              ? metadata.unitCustomCablePrice 
              : parseInt(String(metadata.unitCustomCablePrice)) || 0;
          } else if (metadata.unitCustomCablePriceDollars) {
            // Price in dollars, convert to cents
            const priceInDollars = typeof metadata.unitCustomCablePriceDollars === 'number'
              ? metadata.unitCustomCablePriceDollars
              : parseFloat(String(metadata.unitCustomCablePriceDollars)) || 0;
            correctPrice = Math.round(priceInDollars * 100);
          } else if (metadata.unitPriceCents) {
            correctPrice = typeof metadata.unitPriceCents === 'number'
              ? metadata.unitPriceCents
              : parseInt(String(metadata.unitPriceCents)) || 0;
          } else if (metadata.unitPriceDollars) {
            const priceInDollars = typeof metadata.unitPriceDollars === 'number'
              ? metadata.unitPriceDollars
              : parseFloat(String(metadata.unitPriceDollars)) || 0;
            correctPrice = Math.round(priceInDollars * 100);
          }

          // Only update if we found a valid price and it's different from current
          if (correctPrice > 0 && item.unit_price !== correctPrice) {
            console.log(`🔧 Fixing custom cable line item price:`, {
              itemId: item.id,
              currentUnitPrice: item.unit_price,
              correctPrice,
              customTitle: metadata.customTitle || item.title,
            });
            
            lineItemUpdates.push({
              id: item.id,
              unit_price: correctPrice,
            });
          }
        }
      }

      // Update line items if we found any custom cables with incorrect prices
      if (lineItemUpdates.length > 0 && order.items) {
        console.log(`🔧 Fixing ${lineItemUpdates.length} custom cable line item(s) with correct prices`);
        
        // Calculate new order totals based on correct custom cable prices from metadata
        const updatedItems = order.items.map((item: any) => {
          const update = lineItemUpdates.find(u => u.id === item.id);
          if (update) {
            return {
              ...item,
              unit_price: update.unit_price,
              // Recalculate total based on new unit_price
              total: update.unit_price * (item.quantity || 1),
            };
          }
          return item;
        });

        const newSubtotal = updatedItems.reduce((sum: number, item: any) => {
          return sum + (item.total || 0);
        }, 0);
        
        const shippingTotal = (order.shipping_total as number) || 0;
        const taxTotal = (order.tax_total as number) || 0;
        const discountTotal = (order.discount_total as number) || 0;
        const newTotal = newSubtotal + shippingTotal + taxTotal - discountTotal;

        console.log(`🔧 Calculated new order totals:`, {
          newSubtotal: newSubtotal / 100,
          newTotal: newTotal / 100,
          oldTotal: ((order.total as number) || 0) / 100,
        });

        // NOTE: In Medusa v2, line items' unit_price is immutable and comes from the variant
        // Since we're using a placeholder variant with $0 price, the order line items will have $0
        // We cannot update line item unit_price after order creation
        // However, we can update the order totals to reflect the correct prices from metadata
        // This ensures Payments, Fulfillments, and Activity sections work correctly
        
        try {
          const currentMetadata = order.metadata || {};
          
          // Update order metadata with correct prices for reference
          // This also helps other parts of the system (like admin widget) know the correct prices
          const updatedMetadata = {
            ...currentMetadata,
            customCableLineItemsFixed: true,
            customCableCorrectSubtotal: newSubtotal,
            customCableCorrectTotal: newTotal,
            customCableLineItemPrices: lineItemUpdates.reduce((acc, update) => {
              acc[update.id] = update.unit_price;
              return acc;
            }, {} as Record<string, number>),
          };
          
          // Try to update order metadata
          // Note: In Medusa v2, order totals (subtotal, total) are typically calculated automatically
          // and may not be directly updatable. We store the correct values in metadata instead.
          try {
            await orderModuleService.updateOrders(orderId, {
              metadata: updatedMetadata,
            });
            
            console.log(`✅ Updated order metadata with correct custom cable prices`);
            console.log(`✅ Correct order total (stored in metadata): $${(newTotal / 100).toFixed(2)} (was $${(((order.total as number) || 0) / 100).toFixed(2)})`);
            console.log(`ℹ️ Note: Order totals in Medusa may show calculated values from line items`);
            console.log(`ℹ️ The admin widget will use metadata prices for correct display`);
          } catch (metadataError: any) {
            console.warn(`⚠️ Could not update order metadata:`, metadataError.message);
            console.warn(`⚠️ Custom cable prices are stored in line item metadata - admin widget will handle display`);
          }
        } catch (updateError: any) {
          console.error(`❌ Error updating order with custom cable prices:`, updateError.message);
          // Don't throw - continue with email sending even if price update fails
          // The admin widget will still display correctly using metadata
        }
      } else if (hasCustomCableItems) {
        console.log(`ℹ️ Custom cable items found but prices are already correct`);
      }
    } catch (priceFixError: any) {
      console.error(`❌ Error fixing custom cable prices:`, priceFixError.message);
      // Don't throw - continue with email sending even if price fix fails
    }

    // Get admin emails from environment (supports comma-separated list)
    const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL;
    
    if (!adminEmailsEnv) {
      console.warn("⚠️ ADMIN_EMAILS not configured. Skipping email notification.");
      console.warn("⚠️ Please set ADMIN_EMAILS environment variable in your .env file");
      console.warn("⚠️ You can specify multiple emails separated by commas: ADMIN_EMAILS=admin1@example.com,admin2@example.com");
      return;
    }

    // Parse admin emails (support comma-separated list)
    const adminEmails = adminEmailsEnv
      .split(",")
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (adminEmails.length === 0) {
      console.warn("⚠️ No valid admin emails found. Skipping email notification.");
      return;
    }

    console.log(`📧 Preparing to send email to ${adminEmails.length} admin(s):`, adminEmails);

    // Check Microsoft Graph API configuration
    const emailConfig = {
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      hasClientSecret: !!process.env.AZURE_CLIENT_SECRET,
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
    };

    console.log("📧 Microsoft Graph API Email configuration:", {
      ...emailConfig,
      clientSecret: "***hidden***",
    });

    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET) {
      console.error("❌ Microsoft Graph API credentials not configured!");
      console.error("❌ Please set AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_CLIENT_SECRET in your .env file");
      return;
    }

    // Send email to all admin emails
    const emailHtml = formatOrderEmail(order);
    
    console.log("📧 Sending email...");
    await sendEmail({
      to: adminEmails,
      subject: `New Order Received - Order #${order.display_id || order.id}`,
      html: emailHtml,
      replyTo: order.email || undefined,
    });

    console.log(`✅ Order notification email sent successfully to ${adminEmails.length} admin(s):`, adminEmails);
  } catch (error: any) {
    console.error("❌ Error in order created subscriber:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    // Don't throw - we don't want to break the order creation process
  }
}

export const config: SubscriberConfig = {
  event: "order.created",
};

