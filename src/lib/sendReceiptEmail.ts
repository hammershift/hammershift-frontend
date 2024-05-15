import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

interface ReceiptEmailOptions {
  to: string;
  amountPaid: number;
}

async function sendReceiptEmail({ to, amountPaid }: ReceiptEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
    subject: 'Your Purchase Receipt',
    html: `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
          <div style="font-size: 1.4em; color: #333; margin-bottom: 10px; font-weight: bold;">
            Thank You for Your Purchase!
          </div>
          <div style="font-size: 1em; color: #555;">
            Hello,
            <p>We wanted to confirm your recent deposit of $${amountPaid.toFixed(2)}.</p>
            <p>Thank you for your continued support!</p>
          </div>
          <div style="font-size: 1.2em; color: #000; margin-top: 15px; margin-bottom: 15px;">
            Total Amount Paid: $${amountPaid.toFixed(2)}
          </div>
          <div style="font-size: 0.9em; color: #777;">
            If you have any questions or concerns, feel free to reach out to our support team.
          </div>
        </div>
      </body>
    </html>
  `,
  };

  try {
    await transporter.verify();
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: Message ID', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Failed to send receipt email:', error);
    return { success: false, error: error.message };
  }
}

export { sendReceiptEmail };
