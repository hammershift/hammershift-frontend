import { authOptions } from '@/app/lib/auth';
import clientPromise from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = session.user.id;
  console.log('Session found, userID:', session.user.id);

  const data = await req.json();
  const { fullName, username, country, state, aboutMe } = data;

  // basic validation
  if (!fullName || !username || !country || !state) {
    return NextResponse.json({ message: 'Required fields are missing' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const updateResult = await db.collection('users').updateOne(
      { _id: userID },
      {
        $set: {
          fullName,
          username,
          country,
          state,
          aboutMe,
        },
      }
    );

    // trying this feature as well if there are changes
    if (!updateResult.modifiedCount) {
      return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error during profile update:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
