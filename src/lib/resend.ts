import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";
const APP_NAME = "CareerAI Kenya";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  options: EmailOptions,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}

// Payment confirmation email
export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  amount: number,
  documentType: string,
  receiptNumber: string,
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Poppins', Arial, sans-serif; background-color: #f7faf8; margin: 0; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #00a844, #00c853); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🎉 Payment Confirmed!</h1>
        </div>
        
        <div style="padding: 32px;">
          <p style="color: #0f1f14; font-size: 16px; margin-bottom: 8px;">Hi ${name},</p>
          
          <p style="color: #637a6c; font-size: 14px; line-height: 1.7;">
            Thank you for your payment! Your ${documentType} has been successfully unlocked.
          </p>
          
          <div style="background: #f7faf8; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #637a6c; font-size: 14px;">Receipt No.</span>
              <span style="color: #0f1f14; font-size: 14px; font-weight: 600;">${receiptNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #637a6c; font-size: 14px;">Amount Paid</span>
              <span style="color: #00a844; font-size: 14px; font-weight: 700;">Ksh ${amount}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #637a6c; font-size: 14px;">Status</span>
              <span style="color: #00a844; font-size: 14px; font-weight: 600;">✓ Completed</span>
            </div>
          </div>
          
          <p style="color: #637a6c; font-size: 13px; line-height: 1.7;">
            You can now download your ${documentType} anytime from your dashboard. 
            The download link will remain active forever!
          </p>
          
          <a href="#" style="display: inline-block; background: #00a844; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px;">
            Download Now
          </a>
        </div>
        
        <div style="background: #0f1f14; padding: 24px; text-align: center;">
          <p style="color: #8aab92; font-size: 12px; margin: 0;">
            Made with ❤️ in Kenya
          </p>
          <p style="color: #5c7a64; font-size: 11px; margin-top: 8px;">
            © 2025 CareerAI Kenya. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Payment Confirmed - Your ${documentType} is Ready!`,
    html,
  });
}

// Welcome email
export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Poppins', Arial, sans-serif; background-color: #f7faf8; margin: 0; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #00a844, #00c853); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Welcome to CareerAI! 🚀</h1>
        </div>
        
        <div style="padding: 32px;">
          <p style="color: #0f1f14; font-size: 16px; margin-bottom: 8px;">Hi ${name},</p>
          
          <p style="color: #637a6c; font-size: 14px; line-height: 1.7;">
            Welcome to CareerAI Kenya! We're excited to help you build professional CVs, 
            cover letters, and portfolios that get results.
          </p>
          
          <div style="background: #f7faf8; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #0f1f14; font-size: 14px; margin: 0 0 16px 0;">What you can do:</h3>
            <ul style="color: #637a6c; font-size: 13px; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>Create professional CVs with AI assistance</li>
              <li>Generate tailored cover letters for free</li>
              <li>Build portfolio websites to showcase your work</li>
              <li>Analyze your CV against job descriptions (ATS)</li>
            </ul>
          </div>
          
          <a href="#" style="display: inline-block; background: #00a844; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px;">
            Get Started - It's Free to Try!
          </a>
        </div>
        
        <div style="background: #0f1f14; padding: 24px; text-align: center;">
          <p style="color: #8aab92; font-size: 12px; margin: 0;">
            Made with ❤️ in Kenya
          </p>
          <p style="color: #5c7a64; font-size: 11px; margin-top: 8px;">
            © 2025 CareerAI Kenya. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to CareerAI Kenya! 🎉",
    html,
  });
}

// Payment failure email
export async function sendPaymentFailedEmail(
  email: string,
  name: string,
  amount: number,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Poppins', Arial, sans-serif; background-color: #f7faf8; margin: 0; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: #e53935; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Payment Issue</h1>
        </div>
        
        <div style="padding: 32px;">
          <p style="color: #0f1f14; font-size: 16px; margin-bottom: 8px;">Hi ${name},</p>
          
          <p style="color: #637a6c; font-size: 14px; line-height: 1.7;">
            Unfortunately, your payment of <strong>Ksh ${amount}</strong> could not be processed.
            ${reason ? `Reason: ${reason}` : "Please try again."}
          </p>
          
          <div style="background: #fff3e0; border: 1px solid #ffe082; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #e65100; font-size: 13px; margin: 0; line-height: 1.7;">
              <strong>Common solutions:</strong><br>
              • Ensure you have sufficient M-Pesa balance<br>
              • Check your internet connection<br>
              • Try again in a few minutes
            </p>
          </div>
          
          <a href="#" style="display: inline-block; background: #00a844; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px;">
            Try Payment Again
          </a>
          
          <p style="color: #637a6c; font-size: 13px; margin-top: 24px; line-height: 1.7;">
            Need help? Contact us at support@careeraike.com
          </p>
        </div>
        
        <div style="background: #0f1f14; padding: 24px; text-align: center;">
          <p style="color: #8aab92; font-size: 12px; margin: 0;">
            Made with ❤️ in Kenya
          </p>
          <p style="color: #5c7a64; font-size: 11px; margin-top: 8px;">
            © 2025 CareerAI Kenya. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Payment Issue - CareerAI Kenya",
    html,
  });
}
