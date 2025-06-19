import clientPromise from '@/lib/mongodb';
import connectToDB from '@/lib/mongoose';
import Accounts from '@/models/account.model';
import Users from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

//check email if exists
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

//check username exists
export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const user = await Users.findOne({ username });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    const hasAuthAccount = await Accounts.exists({
      userId: user._id,
    });

    return NextResponse.json({
      exists: true,
      hasPassword: !!hasAuthAccount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}