import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const URI = process.env.MONGODB_URI
const API_KEY: string = process.env.DATA_API_KEY as string

type Todo = {
    userId: number,
    id: number,
    title: string,
    completed: boolean
}

export async function GET() {


}

// delete 18:36
// post 22:03
// put 26:12

