import { NextRequest, NextResponse } from 'next/server';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

interface FeedbackEmailOptions {
  name: string;
  email: string;
  comment: string;
}

async function sendFeedbackEmail({ name, email, comment }: FeedbackEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { SMTP_EMAIL, SMTP_PASSWORD, FEEDBACK_EMAIL } = process.env;

  const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions: SendMailOptions = {
    from: `"HammerShift Feedback" <${SMTP_EMAIL}>`,
    to: FEEDBACK_EMAIL,
    subject: 'New Feedback Submission',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="text-align: center; color: #333;">New Feedback Submission</h1>
        <div style="margin: 20px 0;">
          <p style="font-size: 16px; color: #555;"><strong>Name:</strong> ${name}</p>
          <p style="font-size: 16px; color: #555;"><strong>Email:</strong> ${email}</p>
          <p style="font-size: 16px; color: #555;"><strong>Comment:</strong></p>
          <p style="font-size: 16px; color: #555; padding: 10px; background: #f9f9f9; border-radius: 5px;">${comment}</p>
        </div>
        <footer style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
          <p>HammerShift Team</p>
        </footer>
      </div>
    `,
  };

  try {
    await transporter.verify();
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: Message ID', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Failed to send feedback email:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, comment } = await req.json();

    if (!comment) {
      return NextResponse.json({ message: 'Comment field is required' });
    }

    const result = await sendFeedbackEmail({
      name: name || 'Anonymous',
      email: email || 'No email provided',
      comment,
    });

    if (result.success) {
      return NextResponse.json({ message: 'Feedback sent successfully!' });
    } else {
      return NextResponse.json({ message: 'Failed to send feedback', error: result.error });
    }
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ message: 'Internal server error' });
  }
}
