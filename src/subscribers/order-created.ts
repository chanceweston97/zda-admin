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
      const title = item.title || item.product?.title || "Product";
      const quantity = item.quantity || 1;
      const unitPrice = item.unit_price || 0;
      const totalPrice = unitPrice * quantity;
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${title}</td>
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
        </div>

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

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.warn("⚠️ ADMIN_EMAIL not configured. Skipping email notification.");
      console.warn("⚠️ Please set ADMIN_EMAIL environment variable in your .env file");
      return;
    }

    console.log(`📧 Preparing to send email to admin: ${adminEmail}`);

    // Check email configuration
    const emailConfig = {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      hasPassword: !!process.env.EMAIL_SERVER_PASSWORD,
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
    };

    console.log("📧 Email configuration:", {
      ...emailConfig,
      password: "***hidden***",
    });

    if (!emailConfig.user || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error("❌ Email server credentials not configured!");
      console.error("❌ Please set EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD in your .env file");
      return;
    }

    // Send email to admin
    const emailHtml = formatOrderEmail(order);
    
    console.log("📧 Sending email...");
    await sendEmail({
      to: adminEmail,
      subject: `New Order Received - Order #${order.display_id || order.id}`,
      html: emailHtml,
      replyTo: order.email || undefined,
    });

    console.log(`✅ Order notification email sent successfully to admin: ${adminEmail}`);
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

