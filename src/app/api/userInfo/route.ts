import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('Session:', session);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
  }

  // extract additional profile information from the request body
  const { fullName, username, country, state, aboutMe } = await req.json();

  // validation
  if (!fullName || !username || !country || !state) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  // update or create the user's profile in the MongoDB database
  try {
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('users').updateOne({ email: session.user.email }, { $set: { fullName, username, country, state, aboutMe } }, { upsert: true });
    console.log('Database operation result:', result);

    if (result.upsertedCount > 0) {
      return NextResponse.json({ message: 'Profile created successfully' }, { status: 201 });
    } else {
      return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error during profile creation/update:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
