import clientPromise from '@/app/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

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
      // send a generic response
      return NextResponse.json({ message: 'If an email address is associated with an account, we will process the password reset.' }, { status: 200 });
    }

    // TODO: send a reset token and expiration date for TESTING
    return NextResponse.json({ message: 'Password reset process has been initiated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while processing the password reset request' }, { status: 500 });
  }
}
