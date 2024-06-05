import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

interface OtpEmailOptions {
  to: string;
  otp: string;
}

async function sendOtpEmail({ to, otp }: OtpEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

  const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions: SendMailOptions = {
    from: `"Support Team" <${SMTP_EMAIL}>`,
    to,
    subject: 'Your OTP for Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h1 style="text-align: center; color: #333;">Password Reset Request</h1>
        <p style="color: #555;">Hello,</p>
        <p style="color: #555;">We received a password reset request for your account. Here is your One-Time Password (OTP) to proceed:</p>
        <div style="text-align: center; margin: 20px 0;">
          <h2 style="display: inline-block; padding: 10px 20px; border: 2px dashed #e0e0e0; border-radius: 8px; background-color: #fff; color: #333;">${otp}</h2>
        </div>
        <p style="color: #555;">If you did not request this, please ignore this email or contact support.</p>
        <p style="color: #555;">Thank you,<br/>Support Team</p>
      </div>
    `,
  };

  try {
    await transporter.verify();
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: Message ID', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
}

export { sendOtpEmail };
