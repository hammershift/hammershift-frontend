import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import Car from "@/app/models/car"
import connectMongoDB from '@/app/lib/mongodb'

const URI = process.env.MONGODB_URI
const API_KEY: string = process.env.DATA_API_KEY as string


export async function GET() {
    await connectMongoDB();
    const cars = await Car.findOne({ auction_id: "66514736" });
    return NextResponse.json({ cars });
}





// delete 18:36
// post 22:03
// put 26:12

