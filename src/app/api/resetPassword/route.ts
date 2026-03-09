import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    // connect to DB
    const client = await clientPromise;
    const db = client.db();

    // verify OTP
    const otpRecord = await db.collection('password_reset_tokens').findOne({ email, otp });
    if (!otpRecord || new Date() > new Date(otpRecord.expires)) {
      return NextResponse.json({ message: 'Invalid or expired OTP.' }, { status: 400 });
    }

    // hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // update password in user collection
    await db.collection('users').updateOne({ email }, { $set: { password: hashedPassword } });

    // invalidate the OTP
    await db.collection('password_reset_tokens').deleteOne({ email, otp });

    return NextResponse.json({ message: 'Password reset successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error during password reset:', error);
    return NextResponse.json({ message: 'Error resetting password.' }, { status: 500 });
  }
}
