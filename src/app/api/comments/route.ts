import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import page from "@/app/(pages)/auctions/car_view_page/page";
import connectToDB from "@/lib/mongoose";
import Comments from "@/models/comment.model";
import { Types } from "mongoose";
import { auth } from "@/lib/betterAuth";

// create comment for auction URL: /api/comments
export async function POST(req: NextRequest) {
  const { comment, pageID, pageType, commentID } = await req.json();
  // const session = await auth.api.getSession({

  // })
  // const _id = req.headers.get("x-user-id");
  // const username = req.headers.get("x-user-username");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
  }

  // console.log({
  //   session.user.id,
  //   session.user.username,
  // });
  if (!comment || !pageID || !pageType || !session.user) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();
    const userId = new ObjectId(session.user.id);

    if (commentID) {
      const commentData = {
        _id: new Types.ObjectId(),
        comment: comment,
        pageID: pageID,
        pageType: pageType,
        parentID: new ObjectId(commentID),
        user: {
          userId: userId,
          username: session.user.username,
        },
        likes: [],
        dislikes: [],
        createdAt: new Date(),
      };

      const newComment = new Comments(commentData);
      await newComment.save();
      if (!newComment) {
        return NextResponse.json(
          { message: "Cannot create reply" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          message: "comment posted",
        },
        { status: 200 }
      );
    }

    // create comment
    const commentData = {
      _id: new Types.ObjectId(),
      comment: comment,
      pageID: pageID,
      pageType: pageType,
      user: {
        userId: userId,
        username: session.user.username,
      },
      likes: [],
      dislikes: [],
      createdAt: new Date(),
    };
    const newComment = new Comments(commentData);
    await newComment.save();

    if (!newComment) {
      return NextResponse.json(
        { message: "Cannot create comment" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "comment posted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in creating comment", error);
    return NextResponse.json(
      { message: "Server error in posting comment" },
      { status: 500 }
    );
  }
}

interface SortQuery {
  createdAt?: number;
  likes?: number;
  sort?: string;
}

// get comments for auction/tournament URL: /api/comments?pageID=69113724&offset=0&limit=2&sort=Newest
export async function GET(req: NextRequest) {
  const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
  const pageType = req.nextUrl.searchParams.get("pageType");
  const limit = Number(req.nextUrl.searchParams.get("limit"));
  const pageID = await req.nextUrl.searchParams.get("pageID");
  const parentID = await req.nextUrl.searchParams.get("parentID");
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

  try {
    await connectToDB();

    if (parentID) {
      const replies = await Comments.find({
        parentID: new ObjectId(parentID),
      }).sort({ createdAt: 1 });

      return NextResponse.json(
        {
          replies,
        },
        { status: 200 }
      );
    }

    // check if id is present, otherwise return error
    if (!pageID) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // get comment for auction
    const response = Comments.find({
      pageID: pageID,
      parentID: { $exists: false },
    })
      .limit(limit)
      .skip(offset)
      .sort(sort as any);

    if (!response) {
      return NextResponse.json(
        { message: "No comments found" },
        { status: 400 }
      );
    }

    const comments = await response;

    return NextResponse.json(
      {
        comments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in fetching comments", error);
    return NextResponse.json(
      { message: "Server error, cannot get comments" },
      { status: 500 }
    );
  }
}

//add likes and dislikes and edit comment URL: /api/comments
export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
  }

  const { commentID, key } = await req.json();

  if (!commentID || !key) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();
    const userId = new ObjectId(session.user.id);
    const username = session.user.username;
    // const userId = new ObjectId("65824ed1db2ea85500c815d9");

    let updateOperation;

    switch (key) {
      case "likes":
        updateOperation = { $addToSet: { likes: { userId, username } } };
        break;
      case "dislikes":
        updateOperation = { $addToSet: { dislikes: { userId, username } } };
        break;
      case "removeLikes":
        updateOperation = { $pull: { likes: { userId, username } } };
        break;
      case "removeDislikes":
        updateOperation = { $pull: { dislikes: { userId, username } } };
        break;
      default:
        throw new Error(`Invalid key: ${key}`);
    }

    const commentData = await Comments.updateOne(
      { _id: new ObjectId(commentID) },
      updateOperation
    );

    if (!commentData) {
      console.error("update comment failed");
      return NextResponse.json(
        { message: "Cannot edit comment" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: "comment edited",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in editing comment", error);
    return NextResponse.json(
      { message: "Server error in posting comment" },
      { status: 500 }
    );
  }
}

// Delete comment URL: /api/comments
export async function DELETE(req: NextRequest) {
  const { commentID } = await req.json();

  if (!commentID) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    const commentData = await Comments.deleteOne({
      _id: new ObjectId(commentID),
    });

    await Comments.deleteMany({ parentID: new ObjectId(commentID) });

    if (!commentData.deletedCount) {
      console.error("delete comment failed");
      return NextResponse.json(
        { message: "Cannot delete comment" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: "comment deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in deleting comment", error);
    return NextResponse.json(
      { message: "Server error in deleting comment" },
      { status: 500 }
    );
  }
}
