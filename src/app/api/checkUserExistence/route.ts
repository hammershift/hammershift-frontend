import clientPromise from '@/lib/mongodb';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    await connectToDB();

    const response = {
      emailExists: false,
    };

    if (email) {
      const emailCheck = await Users.findOne({ email });
      if (emailCheck) {
        response.emailExists = true;
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error during user existence check', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
