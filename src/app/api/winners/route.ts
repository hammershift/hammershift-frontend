import clientPromise from '@/lib/mongodb';
import connectToDB from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();

        return NextResponse.json({ message: "hello world" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' });
    }
}