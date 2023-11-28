import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import clientPromise from '@/app/lib/mongodb';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('Session:', session);
  if (!session) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  // extract additional profile information from the request body
  const { fullName, username, country, state, aboutMe } = await req.json();

  // update or create the user's profile in the MongoDB database
  try {
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('users').updateOne({ email: session.user.email }, { $set: { fullName, username, country, state, aboutMe } }, { upsert: true });
    console.log('Database operation result:', result);

    if (result.upsertedCount > 0) {
      return new Response(JSON.stringify({ message: 'Profile created successfully' }), { status: 201 });
    } else {
      return new Response(JSON.stringify({ message: 'Profile updated successfully' }), { status: 200 });
    }
  } catch (error) {
    console.error('Error during profile creation/update:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
