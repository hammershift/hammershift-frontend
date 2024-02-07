import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const id = req.nextUrl.searchParams.get('id');
    const edits = await req.json();

    if (id) {
      const editedAuction = await db
        .collection('tournaments')
        .findOneAndUpdate(
          { $and: [{ _id: new mongoose.Types.ObjectId(id) }, { isActive: true }] },
          { $set: edits },
          { returnDocument: 'after' }
        );

      return NextResponse.json(editedAuction, { status: 202 });
    } else {
      return NextResponse.json({ message: 'Invalid ID provided' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
