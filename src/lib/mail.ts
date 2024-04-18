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
    from: `"Support Team" <${SMTP_EMAIL}>`, // Customize the sender information as needed
    to, // recipient email
    subject: 'Your OTP for Password Reset', // Email subject
    html: `
            <h1>Password Reset Request</h1>
            <p>Hello,</p>
            <p>We received a password reset request for your account. Here is your One-Time Password (OTP) to proceed:</p>
            <h2>${otp}</h2>
            <p>If you did not request this, please ignore this email or contact support.</p>
        `, // Email content
  };

  try {
    await transporter.verify(); // Optional: verifies the SMTP connection is configured correctly
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: Message ID', result.messageId); // Log the message ID for tracking
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
}

export { sendOtpEmail };
