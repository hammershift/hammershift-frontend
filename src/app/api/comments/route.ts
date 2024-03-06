import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import page from '@/app/(pages)/auctions/car_view_page/page';

// create comment for auction URL: /api/comments
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
    }

    const { comment, pageID, pageType } = await req.json();

    if (!comment || !pageID || !pageType) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const userId = new ObjectId(session.user.id);
        // const userId = new ObjectId("65824ed1db2ea85500c815d9");

        // create comment 
        const commentData = await db.collection('comments').insertOne({
            comment,
            pageID,
            pageType,
            user: {
                userId,
                username: session.user.username,
            },
            likes: [],
            dislikes: [],
            replies: [],
            createdAt: new Date(),
        });

        if (!commentData) {
            return NextResponse.json({ message: 'Cannot create comment' }, { status: 400 });
        }




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

// get comments for auction/tournament URL: /api/comments?pageID=69113724&offset=0&limit=2&sort=Newest
export async function GET(req: NextRequest) {
    const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
    const pageType = req.nextUrl.searchParams.get("pageType");
    const limit = Number(req.nextUrl.searchParams.get("limit"));
    const pageID = await req.nextUrl.searchParams.get("pageID");
    let sort: string | SortQuery =
        req.nextUrl.searchParams.get("sort") || "Newest";


    if (sort) {
        switch (sort) {
            case "Newest":
                sort = { createdAt: -1 };
                break;
            case "Oldest":
                sort = { createdAt: 1 };
                break;
            case "Best":
                sort = { likes: -1 };
                break;
            //other sorts here
            default:
                break;
        }
    }



    // check if id is present, otherwise return error
    if (!pageID) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();




        // get comment for auction
        const response = await db.collection('comments').find({ pageID: pageID })
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




//add likes and dislikes and edit comment URL: /api/comments
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
    }

    const { commentID, key } = await req.json();

    if (!commentID || !key) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const userId = new ObjectId(session.user.id);
        // const userId = new ObjectId("65824ed1db2ea85500c815d9");

        let updateOperation;

        switch (key) {
            case "likes":
                updateOperation = { $addToSet: { likes: userId } };
                break;
            case "dislikes":
                updateOperation = { $addToSet: { dislikes: userId } };
                break;
            case "removeLikes":
                updateOperation = { $pull: { likes: userId } };
                break;
            case "removeDislikes":
                updateOperation = { $pull: { dislikes: userId } };
                break;
            default:
                throw new Error(`Invalid key: ${key}`);
        }

        const commentData = await db.collection('comments').updateOne(
            { _id: new ObjectId(commentID) },
            updateOperation
        );


        if (!commentData) {
            console.error("update comment failed")
            return NextResponse.json({ message: 'Cannot edit comment' }, { status: 400 });
        }
        return NextResponse.json(
            {
                message: "comment edited"
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in editing comment', error);
        return NextResponse.json({ message: 'Server error in posting comment' }, { status: 500 });
    }
}


// Delete comment URL: /api/comments
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
    }

    const { commentID } = await req.json();

    if (!commentID) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        // const userId = new ObjectId(session.user.id);

        const commentData = await db.collection('comments').deleteOne(
            { _id: new ObjectId(commentID) }
        );

        if (!commentData.deletedCount) {
            console.error("delete comment failed")
            return NextResponse.json({ message: 'Cannot delete comment' }, { status: 400 });
        }
        return NextResponse.json(
            {
                message: "comment deleted"
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in deleting comment', error);
        return NextResponse.json({ message: 'Server error in deleting comment' }, { status: 500 });
    }
}