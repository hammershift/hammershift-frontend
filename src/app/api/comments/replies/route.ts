import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// create reply for auction URL: /api/comments/replies
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
    }

    const { commentID, reply, auctionID } = await req.json();

    if (!reply || !commentID || !auctionID) {
        console.error("missing required fields")
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const userId = new ObjectId(session.user.id);
        // const userId = new ObjectId("65824ed1db2ea85500c815d9");

        // create comment for auction
        const replyData = {
            _id: new ObjectId(),
            reply,
            user: {
                userId,
                // username: "test",
                username: session.user.username
            },
            commentID,
            auctionID,
            likes: [],
            dislikes: [],
            createdAt: new Date(),
        }


        const replyInserted = await db.collection('comments').updateOne(
            { _id: new ObjectId(commentID) },
            { $push: { replies: replyData } }
        );

        if (!replyInserted) {
            return NextResponse.json({ message: 'Cannot insert reply' }, { status: 400 });
        }

        console.log("replyinserted to comment")
        return NextResponse.json(
            {
                message: "reply was posted and added to comment document"
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in creating reply', error);
        return NextResponse.json({ message: 'Server error in posting reply' }, { status: 500 });
    }
}


// get comments for auction URL: /api/comments/replies?id=69113724&offset=0&limit=2&sort=Newest
export async function GET(req: NextRequest) {
    const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
    const limit = Number(req.nextUrl.searchParams.get("limit"));
    const sort = { createdAt: -1 }


    // get id from url
    const commentID = await req.nextUrl.searchParams.get("id");

    // check if id is present, otherwise return error
    if (!commentID) {
        console.error("missing required fields")
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // get comment for auction
        const response = await db.collection('reply_comments').find({ commentID })
            .limit(limit)
            .skip(offset)
            .sort(sort as any);

        if (!response) {
            return NextResponse.json({ message: 'No replies found' }, { status: 400 });
        }
        const replies = await response.toArray();

        return NextResponse.json(
            {
                replies
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in fetching replies', error);
        return NextResponse.json({ message: 'Server error, cannot get replies' }, { status: 500 });
    }
}




//add likes and dislikes and edit comment URL: /api/comments/replies
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


// Delete comment URL: /api/comments/replies
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);

    // if (!session) {
    //     return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
    // }

    const { replyID, commentID } = await req.json();

    // check if id is present, otherwise return error
    if (!replyID) {
        console.error("missing required fields")
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        // const userId = new ObjectId(session.user.id);

        const commentData = await db.collection('comments').updateOne(
            { _id: new ObjectId(commentID) },
            { $pull: { replies: { _id: new ObjectId(replyID) } } }
        );

        console.log("commentData", commentData)

        if (!commentData.modifiedCount) {
            console.error("delete comment failed")
            return NextResponse.json({ message: 'Cannot delete comment' }, { status: 400 });
        }

        console.log("reply deleted")
        return NextResponse.json(
            {
                message: "reply deleted"
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in deleting reply', error);
        return NextResponse.json({ message: 'Server error in deleting reply' }, { status: 500 });
    }
}