import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { email, username, fullName, provider } = data;

  const lowerCaseEmail = email.toLowerCase();

  // validation based on provider
  const isEmailValid = lowerCaseEmail && lowerCaseEmail.includes('@');
  if (!isEmailValid) {
    return NextResponse.json({ message: 'Invalid email' }, { status: 422 });
  }

  try {
    await connectToDB();

    let existingUsername = await Users.findOne({ username: username });
    if (existingUsername) {
      return NextResponse.json({ message: 'Username already used' }, { status: 422 });
    }

    let existingUser = await Users.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already used' }, { status: 422 });
    }

    const newDate = new Date();

    let newUser = {
      _id: new mongoose.Types.ObjectId(),
      username: username,
      fullName: fullName,
      email: lowerCaseEmail,
      balance: 500, //TODO: change default balance?
      isActive: true,
      isBanned: false,
      provider: provider,
      createdAt: newDate,
      updatedAt: newDate,
    };


    const user = new Users(newUser);
    await user.save();

    return NextResponse.json({ message: 'User created with initial balance', user }, { status: 201 });
  } catch (error) {
    console.error('Error during registration process:', error);
    return NextResponse.json({ message: 'Server error during registration', error }, { status: 500 });
  }
}
