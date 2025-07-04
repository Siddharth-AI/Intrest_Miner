const nodemailer = require("nodemailer");

// Create transporter with your working Gmail settings
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send OTP email for password reset
const sendOTPEmail = async (email, otp, userName = "User") => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Interest Miner"}" <${
        process.env.SMTP_USER
      }>`,
      to: email,
      subject: "Password Reset OTP - Interest Miner",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background-color: #1f2937; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
            .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .info { background-color: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎯 Interest Miner</div>
              <h1>Password Reset OTP</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>We received a request to reset your password for your Interest Miner account. Use the OTP below to proceed with password reset:</p>
              
              <div class="otp-box">
                ${otp}
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes for security reasons.
              </div>
              
              <div class="info">
                <strong>📋 Next Steps:</strong>
                <ol>
                  <li>Use this OTP to verify your identity</li>
                  <li>You'll receive a reset token after verification</li>
                  <li>Set your new password using the reset token</li>
                </ol>
              </div>
              
              <p><strong>Security Tips:</strong></p>
              <ul>
                <li>Never share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Contact support if you have concerns</li>
                <li>This OTP can only be used once</li>
              </ul>
              
              <p>If you have any questions about Facebook ad interests or need help with your account, feel free to contact our support team.</p>
              
              <p>Best regards,<br>The ${
                process.env.APP_NAME || "Interest Miner"
              } Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 Interest Miner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text version for email clients that don't support HTML
      text: `
        Hello ${userName},
        
        We received a request to reset your password for your Interest Miner account.
        
        Your OTP Code: ${otp}
        
        This OTP is valid for 10 minutes only.
        
        Next Steps:
        1. Use this OTP to verify your identity
        2. You'll receive a reset token after verification
        3. Set your new password using the reset token
        
        Security Tips:
        - Never share this OTP with anyone
        - If you didn't request this, please ignore this email
        - Contact support if you have concerns
        
        Best regards,
        Interest Miner Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✓ OTP email sent successfully:", result.messageId);
    return {
      success: true,
      message: "OTP sent successfully",
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("✗ Error sending OTP email:", error);

    // Handle specific errors
    if (error.code === "EAUTH") {
      return {
        success: false,
        message: "Email authentication failed. Please check email credentials.",
      };
    } else if (error.code === "ECONNECTION") {
      return {
        success: false,
        message: "Failed to connect to email server.",
      };
    } else {
      return {
        success: false,
        message: "Failed to send email: " + error.message,
      };
    }
  }
};

// Send welcome email for new registrations
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Interest Miner"}" <${
        process.env.SMTP_USER
      }>`,
      to: email,
      subject: "Welcome to Interest Miner! 🎯",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Interest Miner</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature-box { background-color: #e0f2fe; border: 1px solid #0891b2; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎯 Interest Miner</div>
              <h1>Welcome to Interest Miner!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Welcome to Interest Miner! Your account has been created successfully and you're now ready to discover powerful Facebook ad interests for your business.</p>
              
              <div class="feature-box">
                <h3>🚀 What you can do with Interest Miner:</h3>
                <ul>
                  <li><strong>Search Facebook Ad Interests:</strong> Find targeted interests for your campaigns</li>
                  <li><strong>Business Interest Generation:</strong> Get AI-powered interest suggestions</li>
                  <li><strong>Search History:</strong> Keep track of your previous searches</li>
                  <li><strong>Subscription Plans:</strong> Choose the plan that fits your needs</li>
                </ul>
              </div>
              
              <div class="feature-box">
                <h3>📊 Getting Started:</h3>
                <ol>
                  <li>Choose a subscription plan that suits your needs</li>
                  <li>Start searching for Facebook ad interests</li>
                  <li>Use our business interest generator for AI-powered suggestions</li>
                  <li>Track your search history for future reference</li>
                </ol>
              </div>
              
              <p>If you have any questions or need help getting started, our support team is here to help!</p>
              
              <p>Happy interest mining! 🎯</p>
              
              <p>Best regards,<br>The Interest Miner Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 Interest Miner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("✗ Welcome email error:", error);
    return { success: false, message: error.message };
  }
};

// Send subscription confirmation email
const sendSubscriptionConfirmationEmail = async (
  email,
  userName,
  planName,
  searchLimit,
  endDate
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Interest Miner"}" <${
        process.env.SMTP_USER
      }>`,
      to: email,
      subject: `Subscription Confirmed - ${planName} Plan`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .plan-box { background-color: #d1fae5; border: 1px solid #059669; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎯 Interest Miner</div>
              <h1>✅ Subscription Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Great news! Your subscription has been confirmed and is now active.</p>
              
              <div class="plan-box">
                <h3>📋 Subscription Details:</h3>
                <ul>
                  <li><strong>Plan:</strong> ${planName}</li>
                  <li><strong>Search Limit:</strong> ${searchLimit} searches</li>
                  <li><strong>Valid Until:</strong> ${new Date(
                    endDate
                  ).toLocaleDateString()}</li>
                  <li><strong>Status:</strong> Active ✅</li>
                </ul>
              </div>
              
              <p>You can now start using Interest Miner to discover powerful Facebook ad interests for your business campaigns.</p>
              
              <p>Thank you for choosing Interest Miner!</p>
              
              <p>Best regards,<br>The Interest Miner Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 Interest Miner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      "✓ Subscription confirmation email sent successfully:",
      result.messageId
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("✗ Subscription confirmation email error:", error);
    return { success: false, message: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✓ Email configuration is valid");
    return { success: true, message: "Email configuration is valid" };
  } catch (error) {
    console.error("✗ Email configuration error:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  testEmailConfig,
};
