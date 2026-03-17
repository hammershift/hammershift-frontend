import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 465,
  secure: (Number(process.env.EMAIL_SERVER_PORT) || 465) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const FROM_ADDRESS = process.env.EMAIL_FROM || 'onboarding@velocitymarkets.us';

interface OtpEmailOptions {
  to: string;
  otp: string;
}

async function sendOtpEmail({ to, otp }: OtpEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mailOptions: SendMailOptions = {
    from: `"Velocity Markets" <${FROM_ADDRESS}>`,
    to,
    subject: 'Your Velocity Markets verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #0A0A1A; border-radius: 12px; overflow: hidden; border: 1px solid #1E2A36;">
        <div style="background: linear-gradient(135deg, #0F172A 0%, #0A0A1A 100%); padding: 32px 40px; text-align: center; border-bottom: 1px solid #1E2A36;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #E94560; letter-spacing: -0.5px;">Velocity Markets</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 8px 0;">Password Reset Code</h2>
          <p style="color: #9CA3AF; font-size: 15px; margin: 0 0 32px 0; line-height: 1.6;">Use the code below to reset your password. This code expires in <strong style="color: #ffffff;">10 minutes</strong>.</p>
          <div style="background: #0F172A; border: 1px solid #1E2A36; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="margin: 0 0 8px 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your verification code</p>
            <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 40px; font-weight: 700; color: #00D4AA; letter-spacing: 8px;">${otp}</p>
          </div>
          <p style="color: #6B7280; font-size: 13px; line-height: 1.6; margin: 0;">If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
        </div>
        <div style="padding: 24px 40px; border-top: 1px solid #1E2A36; text-align: center;">
          <p style="margin: 0; color: #6B7280; font-size: 12px;">© 2025 Velocity Markets. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: Message ID', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
}

interface MarketResultEmailOptions {
  to: string;
  marketTitle: string;
  outcome: 'won' | 'lost';
  amount: number;
}

async function sendMarketResultEmail({
  to,
  marketTitle,
  outcome,
  amount,
}: MarketResultEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const outcomeLabel = outcome === 'won' ? 'won' : 'lost';
  const amountLabel = outcome === 'won' ? 'Amount credited' : 'Amount lost';
  const amountFormatted = amount.toFixed(2);

  const mailOptions: SendMailOptions = {
    from: `"Velocity Markets" <${FROM_ADDRESS}>`,
    to,
    subject: `Your prediction result for ${marketTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h1 style="text-align: center; color: #333;">Prediction Result</h1>
        <p style="color: #555;">Hello,</p>
        <p style="color: #555;">Your prediction on <strong>${marketTitle}</strong> has been settled.</p>
        <p style="color: ${outcome === 'won' ? '#00D4AA' : '#E94560'}; font-size: 18px; font-weight: bold;">
          You ${outcomeLabel} your prediction!
        </p>
        <p style="color: #555;">${amountLabel}: <strong>$${amountFormatted}</strong></p>
        <p style="color: #555;">Thank you for participating in Velocity Markets.</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Market result email sent: Message ID', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Failed to send market result email:', error);
    return { success: false, error: error.message };
  }
}

interface WelcomeEmailOptions {
  to: string;
  fullName: string;
}

async function sendWelcomeEmail({ to, fullName }: WelcomeEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mailOptions: SendMailOptions = {
    from: `"Velocity Markets" <${FROM_ADDRESS}>`,
    to,
    subject: 'Welcome to Velocity Markets',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; background-color: #0A0A1A; border-radius: 12px; border: 1px solid #1a1a2e;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #E94560; font-size: 28px; margin: 0; letter-spacing: -0.5px;">Velocity Markets</h1>
        </div>
        <h2 style="color: #ffffff; font-size: 22px; margin-bottom: 16px;">Welcome, ${fullName}!</h2>
        <p style="color: #a0a0b8; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          Your account is live. You are ready to start making predictions on collector car auctions and climbing the leaderboard.
        </p>
        <p style="color: #a0a0b8; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Your starting balance of <span style="color: #00D4AA; font-family: monospace; font-weight: bold;">$500.00</span> has been credited to your account. Use it to place your first prediction.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://velocitymarkets.us" style="display: inline-block; padding: 14px 32px; background-color: #E94560; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.3px;">
            Start Predicting
          </a>
        </div>
        <p style="color: #606078; font-size: 13px; text-align: center; margin-top: 32px; border-top: 1px solid #1a1a2e; padding-top: 20px;">
          You are receiving this email because you created an account on Velocity Markets.<br/>
          Questions? Reply to this email or contact support.
        </p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: Message ID', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

export { sendOtpEmail, sendMarketResultEmail, sendWelcomeEmail };
