import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { sendEmail } from "../../../lib/email";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const body = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      productOrService?: string;
      company?: string;
      message?: string;
    };
    const { firstName, lastName, email, phone, productOrService, company, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !company) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("❌ ADMIN_EMAIL is not configured");
      return res.status(500).json({
        message: "Email service is not configured. Please contact support directly.",
        emailStatus: {
          sent: false,
          error: "ADMIN_EMAIL environment variable is not set",
          configured: false,
        },
      });
    }

    let emailSent = false;
    let emailError: any = null;

    try {
      const escapeHtml = (text: string) => {
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const emailSubject = `New Quote Request from ${escapeHtml(firstName)} ${escapeHtml(lastName)}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2958A4;">New Quote Request</h2>
          <div style="background-color: #f4f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>
            <p><strong>Company:</strong> ${escapeHtml(company)}</p>
            <p><strong>Product/Service:</strong> ${escapeHtml(productOrService || "Not specified")}</p>
            <p><strong>Message:</strong><br>${message ? escapeHtml(message).replace(/\n/g, '<br>') : 'No message provided'}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the quote request form on your website.
          </p>
        </div>
      `;

      const fromDomain = (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "").split("@")[1];
      const submitterDomain = email.trim().split("@")[1];
      const replyToAddress = submitterDomain === fromDomain 
        ? email.trim() 
        : (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER);

      const emailResult = await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
        replyTo: replyToAddress,
      });

      if (emailResult && emailResult.accepted && emailResult.accepted.length > 0) {
        emailSent = true;
        console.log(`✅ Quote request email sent successfully to: ${adminEmail}`);
      } else if (emailResult && emailResult.rejected && emailResult.rejected.length > 0) {
        emailError = `Email rejected: ${emailResult.rejected.join(", ")}`;
      } else if (emailResult) {
        emailSent = true;
      } else {
        emailError = "Email service returned null";
      }
    } catch (err: any) {
      emailError = err;
      console.error("❌ Failed to send quote request email:", err);
    }

    const responseData: any = {
      message: "Quote request submitted successfully!",
      emailStatus: {
        sent: emailSent,
        error: emailError ? (emailError.message || String(emailError)) : null,
        configured: !!(process.env.AZURE_CLIENT_ID && process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_SECRET),
      },
    };

    return res.status(201).json(responseData);
  } catch (error: any) {
    console.error("Quote request error:", error);
    return res.status(500).json({
      message: error.message || "Failed to submit quote request. Please try again.",
    });
  }
}

