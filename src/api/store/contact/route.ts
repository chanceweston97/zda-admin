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
      company?: string;
      message?: string;
    };
    const { firstName, lastName, email, phone, company, message } = body;

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

    // Check email service configuration before attempting to send
    const hasAzureConfig = !!(process.env.AZURE_CLIENT_ID && process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_SECRET);
    const hasEmailFrom = !!(process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER);
    
    if (!hasAzureConfig) {
      console.error("❌ Microsoft Graph API credentials are missing");
      return res.status(500).json({
        message: "Email service is not configured. Please contact support directly.",
        emailStatus: {
          sent: false,
          error: "Azure credentials (AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_CLIENT_SECRET) are not configured",
          configured: false,
        },
      });
    }

    if (!hasEmailFrom) {
      console.error("❌ EMAIL_FROM or EMAIL_SERVER_USER is not configured");
      return res.status(500).json({
        message: "Email service is not configured. Please contact support directly.",
        emailStatus: {
          sent: false,
          error: "EMAIL_FROM or EMAIL_SERVER_USER environment variable is not set",
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

      const emailSubject = `New Contact Form Submission from ${escapeHtml(firstName)} ${escapeHtml(lastName)}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2958A4;">New Contact Form Submission</h2>
          <div style="background-color: #f4f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>
            <p><strong>Company:</strong> ${escapeHtml(company)}</p>
            <p><strong>Message:</strong><br>${message ? escapeHtml(message).replace(/\n/g, '<br>') : 'No message provided'}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the contact form on your website.
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
        console.log(`✅ Contact form email sent successfully to: ${adminEmail}`);
      } else if (emailResult && emailResult.rejected && emailResult.rejected.length > 0) {
        emailError = `Email rejected: ${emailResult.rejected.join(", ")}`;
      } else if (emailResult) {
        emailSent = true;
      } else {
        // More specific error message
        if (!hasAzureConfig) {
          emailError = "Azure credentials are missing. Check AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_CLIENT_SECRET.";
        } else if (!hasEmailFrom) {
          emailError = "EMAIL_FROM or EMAIL_SERVER_USER is not set.";
        } else {
          emailError = "Email service failed. Check backend logs for details.";
        }
      }
    } catch (err: any) {
      emailError = err;
      console.error("❌ Failed to send contact form email:", err);
    }

    const responseData: any = {
      message: "Contact form submitted successfully!",
      emailStatus: {
        sent: emailSent,
        error: emailError ? (emailError.message || String(emailError)) : null,
        configured: hasAzureConfig && hasEmailFrom,
      },
    };

    return res.status(201).json(responseData);
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      message: error.message || "Failed to submit contact form. Please try again.",
    });
  }
}

