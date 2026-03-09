import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, retryAfter } = checkRateLimit(ip, 10, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ message: 'Too many attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } });
    }

    const { otp } = await req.json();

    // connect to DB
    const client = await clientPromise;
    const db = client.db();

    // check OTP code record in the collection
    const otpCodeRecord = await db.collection('password_reset_tokens').findOne({ otp });
    if (!otpCodeRecord) {
      return NextResponse.json({ message: 'Invalid or incorrect OTP code' }, { status: 400 });
    }

    // check if the OTP has expired
    if (new Date() > new Date(otpCodeRecord.expires)) {
      return NextResponse.json({ message: 'OTP code has expired' }, { status: 400 });
    }

    // invalidate the OTP so it cannot be reused
    await db.collection('password_reset_tokens').deleteOne({ otp });

    // if OTP code is valid
    return NextResponse.json({ message: 'OTP code verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return NextResponse.json({ message: 'An error occurred while verifying the OTP code' }, { status: 500 });
  }
}
