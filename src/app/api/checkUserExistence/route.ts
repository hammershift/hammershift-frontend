import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { username, email } = await req.json();

  try {
    const client = await clientPromise;
    const db = client.db();

    const response = {
      emailExists: false,
      usernameExists: false,
    };

    if (email) {
      const emailCheck = await db.collection('users').findOne({ email });
      if (emailCheck) {
        response.emailExists = true;
      }
    }

    if (username) {
      const usernameCheck = await db.collection('users').findOne({ username });
      if (usernameCheck) {
        response.usernameExists = true;
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error during user existence check', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
