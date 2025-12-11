import nodemailer from "nodemailer";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

// PrivateEmail.com SMTP configuration
const smtpOptions = {
  host: process.env.EMAIL_SERVER_HOST || "mail.privateemail.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_PORT === "465", // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: process.env.EMAIL_SERVER_USER, // Your full PrivateEmail.com email address
    pass: process.env.EMAIL_SERVER_PASSWORD, // Your PrivateEmail.com account password
  },
  // Additional options for PrivateEmail.com
  tls: {
    // Do not fail on invalid certificates (some servers have self-signed certs)
    rejectUnauthorized: false,
  },
};

export const sendEmail = async (data: EmailPayload) => {
  // Validate email configuration
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error("❌ Email server credentials are not configured. Please set EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD environment variables.");
    return null; // Don't throw error, just log and return null
  }

  // Log configuration (without sensitive data)
  console.log("📧 PrivateEmail.com SMTP Configuration:", {
    host: smtpOptions.host,
    port: smtpOptions.port,
    secure: smtpOptions.secure ? "SSL (465)" : "TLS (587)",
    user: process.env.EMAIL_SERVER_USER,
    from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
    hasPassword: !!process.env.EMAIL_SERVER_PASSWORD,
    server: "PrivateEmail.com",
  });

  const transporter = nodemailer.createTransport({
    ...smtpOptions,
    // Add additional options for better error reporting
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
  });

  // Verify connection before sending
  try {
    await transporter.verify();
    console.log("✓ SMTP server connection verified");
  } catch (verifyError: any) {
    console.error("✗ SMTP server connection failed:", {
      error: verifyError.message,
      code: verifyError.code,
      command: verifyError.command,
      response: verifyError.response,
    });
    // Don't throw - just log the error
    return null;
  }

  try {
    // PrivateEmail.com requires the "From" address to match the authenticated user
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER;
    
    if (fromAddress !== process.env.EMAIL_SERVER_USER) {
      console.warn("⚠️ Warning: EMAIL_FROM doesn't match EMAIL_SERVER_USER. PrivateEmail.com may reject emails if they don't match.");
    }

    const result = await transporter.sendMail({
      from: fromAddress,
      to: Array.isArray(data.to) ? data.to.join(", ") : data.to,
      replyTo: data.replyTo,
      subject: data.subject,
      html: data.html,
    });

    console.log("✅ Email sent successfully:", {
      messageId: result.messageId,
      accepted: result.accepted || [],
      rejected: result.rejected || [],
      response: result.response,
    });

    // Warn if email was rejected
    if (result.rejected && result.rejected.length > 0) {
      console.error("⚠️ Some email addresses were rejected:", result.rejected);
    }

    return result;
  } catch (sendError: any) {
    console.error("❌ Email send failed:", {
      error: sendError.message,
      code: sendError.code,
      command: sendError.command,
      response: sendError.response,
      responseCode: sendError.responseCode,
    });
    // Don't throw - just log the error
    return null;
  }
};

