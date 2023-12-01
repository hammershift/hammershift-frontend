import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import otpGenerator from 'otp-generator';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { email } = data;

    // connect to DB
    const client = await clientPromise;
    const db = client.db();

    // look for the user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'If an email address is associated with an account, we will process the password reset.' }, { status: 200 });
    }

    // otp generator
    const otp = otpGenerator.generate(6, {
      digits: true,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });
    const expirationDate = new Date(new Date().getTime() + 1 * 60000);

    // store it in the db
    console.log('Inserting OTP into the database');
    await db.collection('password_reset_tokens').insertOne({
      userId: user._id,
      email: email,
      otp: otp,
      expires: expirationDate,
    });
    console.log('OTP inserted successfully');

    // TODO: Reset token to store, and expiration date maybe?
    return NextResponse.json({ message: 'Password reset process has been initiated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while processing the password reset request' }, { status: 500 });
  }
}
