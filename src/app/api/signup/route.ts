import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();
  const { email, password } = data;

  if (!email || !password || !email.includes('@') || password.trim().length < 7) {
    return NextResponse.json({ message: 'Invalid input' }, { status: 422 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 422 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // create a new user with a balance field
    await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      isActive: true,
      balance: 100, // initial wallet balance
    });

    return NextResponse.json({ message: 'User created with initial balance' }, { status: 201 });
  } catch (error) {
    console.error('Error during registration process:', error);
    return NextResponse.json({ message: 'Server error during registration' }, { status: 500 });
  }
}
