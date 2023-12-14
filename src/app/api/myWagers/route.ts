import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  console.log('User ID from session:', session.user.id);

  try {
    const client = await clientPromise;
    const db = client.db();

    const userIdFromSession = session.user.id;
    const userWagers = await db
      .collection('wagers')
      .find({ 'user._id': new ObjectId(userIdFromSession) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ wagers: userWagers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user wagers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
