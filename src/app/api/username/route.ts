import clientPromise from '@/lib/mongodb';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// get winners, URL: /api/username body: { userID: string }
export async function POST(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const { userID } = await req.json();

        const user = await db.collection('users').findOne(
            { _id: new mongoose.Types.ObjectId(userID) },
            { projection: { _id: 0, username: 1 } }
        );

        const username = user ? user.username : null;

        if (!username) {
            return NextResponse.json({ username: "no username found" });
        }


        return NextResponse.json({ username });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' });
    }
}