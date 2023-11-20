import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse, NextRequest } from 'next/server'
import Car from "@/app/models/car"
import connectMongoDB from '@/app/lib/mongodb'


// get document using auction_id : http://localhost:3000/api/cars?id=63075635 : http://localhost:3000/api/cars?limit=21&offset=0
// export async function GET(request: NextRequest) {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
// const limit = searchParams.get("limit");
// const offset = searchParams.get("offset");
// await connectMongoDB();
// if (id) {
//     try {
//         const cars = await Car.findOne({ auction_id: id });
//         return NextResponse.json({ cars });

//     } catch (error) {
//         console.error({ error: error });
//     }

// } else {
//TODO: add status to properties
// const cars = await Car.find(status : "ongoing");
// const carsArray = cars.slice(offset, limit)
// return NextResponse.json({ cars });
//     }
// }

export async function GET(request: NextRequest) {
    await connectMongoDB();
    const auction_id = request.nextUrl.searchParams.get('auction_id');
    const offset = Number(request.nextUrl.searchParams.get('offset')) || 0;
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 7;
    if (!auction_id) {
        try {
            const cars = await Car.find().limit(limit).skip(offset);
            return NextResponse.json({ cars }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ message: error }, { status: 500 });
        }
    }
    try {
        const car = await Car.findOne({ auction_id: auction_id });
        return NextResponse.json({ car }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }

}