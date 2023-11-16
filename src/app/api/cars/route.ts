import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse, NextRequest } from 'next/server'
import Car from "@/app/models/car"
import connectMongoDB from '@/app/lib/mongodb'

type Props = {
    params: {
        id: string
    }
}

// get one document using auction_id
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await connectMongoDB();
    const cars = await Car.findOne({ auction_id: id });
    return NextResponse.json({ cars });
}