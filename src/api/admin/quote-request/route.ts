import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendEmail } from "../../../lib/email"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { firstName, lastName, email, phone, productOrService, company, message, isContactForm } = req.body as {
      firstName: string
      lastName: string
      email: string
      phone: string
      productOrService?: string
      company: string
      message?: string
      isContactForm?: boolean
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !company) {
      res.status(400).json({
        message: "All required fields must be provided"
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({
        message: "Invalid email format"
      })
      return
    }

    // Check Microsoft Graph API configuration
    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET) {
      console.error("❌ Microsoft Graph API configuration missing")
      res.status(500).json({
        message: "Email server is not configured. Please contact administrator."
      })
      return
    }

    // Get recipient email from environment
    const recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER
    if (!recipientEmail) {
      console.error("❌ No recipient email configured")
      res.status(500).json({
        message: "Email recipient is not configured. Please contact administrator."
      })
      return
    }

    // Escape HTML to prevent XSS attacks
    const escapeHtml = (text: string) => {
      return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }

    // Determine email subject and content based on form type
    const emailSubject = isContactForm
      ? `New Contact Form Submission from ${escapeHtml(firstName)} ${escapeHtml(lastName)}`
      : `New Quote Request from ${escapeHtml(firstName)} ${escapeHtml(lastName)}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isContactForm ? "Contact Form" : "Quote Request"}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <div style="background-color: #2958A4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">${isContactForm ? "New Contact Form Submission" : "New Quote Request"}</h2>
        </div>
        
        <div style="background-color: #f4f5f7; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
          <div style="background-color: white; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #2958A4;">${escapeHtml(email)}</a></p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color: #2958A4;">${escapeHtml(phone)}</a></p>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${escapeHtml(company)}</p>
            ${productOrService && !isContactForm ? `<p style="margin: 5px 0;"><strong>Product or Service:</strong> ${escapeHtml(productOrService)}</p>` : ""}
            ${message ? `<p style="margin: 5px 0;"><strong>Message:</strong></p><p style="margin: 5px 0; white-space: pre-wrap;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>` : ""}
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px; text-align: center;">
            This email was sent from the ${isContactForm ? "contact form" : "quote request form"} on your website.
          </p>
        </div>
      </body>
      </html>
    `

    // Determine reply-to address
    const fromDomain = (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "").split("@")[1]
    const submitterDomain = email.trim().split("@")[1]
    const replyToAddress = submitterDomain === fromDomain 
      ? email.trim() 
      : (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER)

    console.log("📧 Sending email:", {
      to: recipientEmail,
      subject: emailSubject,
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      replyTo: replyToAddress,
    })

    // Send email
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
      replyTo: replyToAddress,
    })

    // Check if email was accepted
    if (emailResult && emailResult.accepted && emailResult.accepted.length > 0) {
      console.log("✅ Email sent successfully:", {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
      })
      res.status(200).json({
        message: "Email sent successfully",
        sent: true,
      })
    } else {
      console.error("❌ Email was not accepted:", {
        rejected: emailResult?.rejected || [],
        response: emailResult?.response,
      })
      res.status(500).json({
        message: "Email was not accepted by the server",
        sent: false,
        error: emailResult?.rejected?.join(", ") || "Unknown error",
      })
    }
  } catch (error: any) {
    console.error("❌ Error processing quote request:", error)
    res.status(500).json({
      message: error.message || "Failed to process request",
      sent: false,
      error: error.message,
    })
  }
}



