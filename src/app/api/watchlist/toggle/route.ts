import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any)._id || (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: 'No user ID' }, { status: 400 });
  }

  const body = await req.json();
  const { marketId } = body;
  if (!marketId) {
    return NextResponse.json({ error: 'marketId required' }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db;
  if (!db) return NextResponse.json({ error: 'DB not connected' }, { status: 500 });

  const collection = db.collection('watchlists');

  // Check if already watchlisted
  const existing = await collection.findOne({
    userId: userId.toString(),
    marketId: marketId.toString(),
  });

  if (existing) {
    // Remove from watchlist
    await collection.deleteOne({ _id: existing._id });
    return NextResponse.json({ bookmarked: false });
  } else {
    // Add to watchlist
    await collection.insertOne({
      userId: userId.toString(),
      marketId: marketId.toString(),
      createdAt: new Date(),
    });
    return NextResponse.json({ bookmarked: true });
  }
}
