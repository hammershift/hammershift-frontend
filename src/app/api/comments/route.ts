import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';


export async function POST(req: NextRequest) {
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
    // }

    const { comment, auctionID } = await req.json();

    if (!comment || !auctionID) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        // const userId = new ObjectId(session.user.id);
        const userId = new ObjectId("65824ed1db2ea85500c815d9");

        // create comment for auction
        const commentData = await db.collection('comments').insertOne({
            comment,
            auctionID,
            user: {
                userId,
                username: "test",
            },
            createdAt: new Date(),
        });

        return NextResponse.json(
            {
                message: "comment posted"
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in creating comment', error);
        return NextResponse.json({ message: 'Server error in posting comment' }, { status: 500 });
    }
}



interface SortQuery {
    createdAt?: number;
    "likes"?: number;
    "sort"?: string;
}

// get comments for auction URL: /api/comments?id=69113724&offset=0&limit=2&sort=Newest
export async function GET(req: NextRequest) {
    const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
    const limit = Number(req.nextUrl.searchParams.get("limit"));
    let sort: string | SortQuery =
        req.nextUrl.searchParams.get("sort") || "Newest";

    //check for athorization
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
    }

    if (sort) {
        switch (sort) {
            case "Newest":
                sort = { createdAt: -1 };
                break;
            case "Oldest":
                sort = { createdAt: 1 };
                break;
            case "Best":
                sort = { likes: 1 };
                break;
            //other sorts here
            default:
                break;
        }
    }





    // get if from url
    const auctionID = await req.nextUrl.searchParams.get("id");

    // check if id is present, otherwise return error
    if (!auctionID) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // get comment for auction
        const response = await db.collection('comments').find({ auctionID: auctionID })
            .limit(limit)
            .skip(offset)
            .sort(sort as any);

        if (!response) {
            return NextResponse.json({ message: 'No comments found' }, { status: 400 });
        }
        const comments = await response.toArray();

        return NextResponse.json(
            {
                comments
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in fetching comments', error);
        return NextResponse.json({ message: 'Server error, cannot get comments' }, { status: 500 });
    }
}