import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { email, password, provider } = data;

  const lowerCaseEmail = email.toLowerCase();

  // validation based on provider
  const isEmailValid = lowerCaseEmail && lowerCaseEmail.includes('@');
  const isPasswordValid = provider === 'credentials' ? password && password.trim().length >= 7 : true;
  if (!isEmailValid || !isPasswordValid) {
    return NextResponse.json({ message: 'Invalid input' }, { status: 422 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 422 });
    }

    let newUser = {
      email: lowerCaseEmail,
      balance: 500,
      isActive: true,
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: provider,
    };

    // only hash password and add it to newUser if provider is credentials
    if (provider === 'credentials') {
      const hashedPassword = await bcrypt.hash(password, 12);
      newUser = { ...newUser, password: hashedPassword } as typeof newUser & { password: string };
    }

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json({ message: 'User created with initial balance', result }, { status: 201 });
  } catch (error) {
    console.error('Error during registration process:', error);
    return NextResponse.json({ message: 'Server error during registration' }, { status: 500 });
  }
}
