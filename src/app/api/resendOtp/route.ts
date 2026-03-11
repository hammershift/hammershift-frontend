import { sendOtpEmail } from '@/lib/mail';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, retryAfter } = checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } });
    }

    const data = await req.json();
    const { email } = data;

    // connect to DB
    const client = await clientPromise;
    const db = client.db();

    // look for the user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'No account associated with this email address.' }, { status: 404 });
    }

    // generate a new OTP
    const newOtp = randomInt(100000, 999999).toString();

    const newExpirationDate = new Date(new Date().getTime() + 10 * 60000);

    // update the OTP in the db
    await db.collection('password_reset_tokens').updateOne({ userId: user._id }, { $set: { otp: newOtp, expires: newExpirationDate, email: user.email } }, { upsert: true });

    // send the new OTP via email
    const emailResult = await sendOtpEmail({ to: user.email, otp: newOtp });
    if (!emailResult.success) {
      console.error('Failed to resend OTP email:', emailResult.error);
      return NextResponse.json({ message: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'A new OTP has been sent to your email' }, { status: 200 });
  } catch (error) {
    console.error('Error during OTP resend:', error);
    return NextResponse.json({ message: 'An error occurred while resending the OTP.' }, { status: 500 });
  }
}
