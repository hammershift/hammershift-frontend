import mongoose from 'mongoose';

import { NextRequest, NextResponse } from 'next/server';
import getServerSession from 'next-auth/next';

import { Wager } from '@/app/models/wager';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { carId, priceGuessed, wagerAmount, user } = await req.json();

    if (!carId || priceGuessed === undefined || wagerAmount === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newWager = new Wager({
      _id: new mongoose.Types.ObjectId(),
      carId: carId,
      priceGuessed: priceGuessed,
      wagerAmount: wagerAmount,
      user: user,
    });

    await db.collection('wagers').insertOne(newWager);

    return NextResponse.json({ message: 'Wager created usccessfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
