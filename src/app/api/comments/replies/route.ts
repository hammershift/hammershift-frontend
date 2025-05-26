import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDB from "@/lib/mongoose";
import Comments from "@/models/comment.model";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";

// create reply for auction URL: /api/comments/replies
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
  }

  const { commentID, reply, pageID, pageType } = await req.json();

  if (!reply || !commentID || !pageID || !pageType) {
    console.error("missing required fields");
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();
    const userId = new ObjectId(session.user.id);
    // const userId = new ObjectId("65824ed1db2ea85500c815d9");

    // create comment for auction
    const replyData = {
      _id: new ObjectId(),
      comment: reply,
      pageID: pageID,
      pageType: pageType,
      user: {
        userId,
        username: session.user.username,
      },
      parentID: commentID,
      likes: [],
      dislikes: [],
      createdAt: new Date(),
    };

    const replyInserted = await Comments.updateOne(
      { _id: new ObjectId(commentID) },
      { $push: { replies: replyData } }
    );

    if (!replyInserted) {
      return NextResponse.json(
        { message: "Cannot insert reply" },
        { status: 400 }
      );
    }

    console.log("replyinserted to comment");
    return NextResponse.json(
      {
        message: "reply was posted and added to comment document",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in creating reply", error);
    return NextResponse.json(
      { message: "Server error in posting reply" },
      { status: 500 }
    );
  }
}

// get comments for auction URL: /api/comments/replies?id=69113724&offset=0&limit=2&sort=Newest
export async function GET(req: NextRequest) {
  const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
  const limit = Number(req.nextUrl.searchParams.get("limit"));
  const sort = { createdAt: -1 };

  // get id from url
  const commentID = await req.nextUrl.searchParams.get("id");

  // check if id is present, otherwise return error
  if (!commentID) {
    console.error("missing required fields");
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    // get comment for auction
    const response = await Comments.find({ parentID: commentID })
      .limit(limit)
      .skip(offset)
      .sort(sort as any);

    if (!response) {
      return NextResponse.json(
        { message: "No replies found" },
        { status: 400 }
      );
    }
    const replies = await response;

    return NextResponse.json(
      {
        replies,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in fetching replies", error);
    return NextResponse.json(
      { message: "Server error, cannot get replies" },
      { status: 500 }
    );
  }
}

//add likes and dislikes and edit reply. URL: /api/comments/replies
export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
  }

  const { commentID, replyID, key } = await req.json();

  if (!commentID || !key) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    // const userId = new ObjectId("65824ed1db2ea85500c815d9");
    const userId = new ObjectId(session.user.id);

    let updateOperation;

    switch (key) {
      case "likes":
        updateOperation = { $addToSet: { "replies.$[elem].likes": userId } };
        break;
      case "dislikes":
        updateOperation = { $addToSet: { "replies.$[elem].dislikes": userId } };
        break;
      case "removeLikes":
        updateOperation = { $pull: { "replies.$[elem].likes": userId } };
        break;
      case "removeDislikes":
        updateOperation = { $pull: { "replies.$[elem].dislikes": userId } };
        break;
      default:
        throw new Error(`Invalid key: ${key}`);
    }

    // Define the operation based on the key
    const operations: any = {
      likes: {
        update: { $addToSet: { "replies.$[elem].likes": userId } },
        error: "cannot like reply",
        success: "reply liked",
      },
      dislikes: {
        update: { $addToSet: { "replies.$[elem].dislikes": userId } },
        error: "cannot dislike reply",
        success: "reply disliked",
      },
      removeLikes: {
        update: { $pull: { "replies.$[elem].likes": userId } },
        error: "cannot remove like reply",
        success: "reply like removed",
      },
      removeDislikes: {
        update: { $pull: { "replies.$[elem].dislikes": userId } },
        error: "cannot remove dislike reply",
        success: "reply dislike removed",
      },
    };

    // Check if the key is valid
    if (!operations[key]) {
      console.error(`Invalid key: ${key}`);
      return NextResponse.json(
        { message: "Invalid operation" },
        { status: 400 }
      );
    }

    // Continue with the update operation
    const replyData = await db
      .collection("comments")
      .updateOne({ _id: new ObjectId(commentID) }, operations[key].update, {
        arrayFilters: [{ "elem._id": new ObjectId(replyID) }],
      });

    if (!replyData.modifiedCount) {
      console.error(operations[key].error);
      return NextResponse.json(
        { message: "Cannot like/dislike reply" },
        { status: 400 }
      );
    }

    console.log(operations[key].success);
    return NextResponse.json(
      {
        message: `reply was edited - ${key}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in liking/disliking reply", error);
    return NextResponse.json(
      { message: "Server error in posting comment" },
      { status: 500 }
    );
  }
}

// Delete comment URL: /api/comments/replies
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
  }

  const { replyID, commentID } = await req.json();

  // check if id is present, otherwise return error
  if (!replyID) {
    console.error("missing required fields");
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    // const userId = new ObjectId(session.user.id);

    const commentData = await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(commentID) },
        { $pull: { replies: { _id: new ObjectId(replyID) } } }
      );

    if (!commentData.modifiedCount) {
      console.error("delete comment failed");
      return NextResponse.json(
        { message: "Cannot delete comment" },
        { status: 400 }
      );
    }

    console.log("reply deleted");
    return NextResponse.json(
      {
        message: "reply deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in deleting reply", error);
    return NextResponse.json(
      { message: "Server error in deleting reply" },
      { status: 500 }
    );
  }
}
