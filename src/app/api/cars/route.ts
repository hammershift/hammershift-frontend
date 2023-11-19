import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse, NextRequest } from 'next/server'
import Car from "@/app/models/car"
import connectMongoDB from '@/app/lib/mongodb'


// get document using auction_id : http://localhost:3000/api/cars?id=63075635 : http://localhost:3000/api/cars?limit=21&offset=0
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    // const limit = searchParams.get("limit");
    // const offset = searchParams.get("offset");
    await connectMongoDB();
    if (id) {
        try {
            const cars = await Car.findOne({ auction_id: id });
            return NextResponse.json({ cars });

        } catch (error) {
            console.error({ error: error });
        }

    } else {
        //TODO: add status to properties
        // const cars = await Car.find(status : "ongoing");
        // const carsArray = cars.slice(offset, limit)
        // return NextResponse.json({ cars });
    }
}

