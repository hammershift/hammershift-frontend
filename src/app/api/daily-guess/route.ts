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

  const body = await req.json();
  const { auctionId, guessedPrice } = body;

  if (!auctionId || typeof guessedPrice !== 'number' || guessedPrice <= 0) {
    return NextResponse.json({ error: 'Invalid guess' }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  // One guess per user per auction
  const existing = await db.collection('daily_guesses').findOne({
    userId: session.user.id ?? session.user.email,
    auctionId,
  });

  if (existing) {
    return NextResponse.json({ error: 'Already guessed for this auction' }, { status: 409 });
  }

  await db.collection('daily_guesses').insertOne({
    userId: session.user.id ?? session.user.email,
    userEmail: session.user.email,
    auctionId,
    guessedPrice,
    submittedAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
