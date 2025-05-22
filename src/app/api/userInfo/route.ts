import { authClient } from "@/lib/auth-client";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";

export async function POST(req: NextRequest) {
  const session = await authClient.getSession();
  if (!session || !session.data) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
  }

  const { about } = await req.json();

  try {
    await connectToDB();

    const updatedUser = await Users.findOneAndUpdate(
      { email: session.data.user.email },
      {
        $set: { about },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during userInfo POST:", error);
    return NextResponse.json(
      { message: "Server error during userInfo POST" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // const { data: session } = await authClient.useSession();
  // console.log(session);
  // // if not  logged in, return error
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
  // }

  const email = req.nextUrl.searchParams.get("email");
  //if ID is not provided, return error
  if (!email) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
  try {
    await connectToDB();
    let existingUser = await Users.findOne({ email: email });

    return NextResponse.json({ user: existingUser }, { status: 200 });
  } catch (error) {
    console.error("Error during userInfo GET:", error);
    return NextResponse.json(
      { message: "Server error during userInfo GET" },
      { status: 500 }
    );
  }
}

// export async function PUT(req: NextRequest) {
//   // const session = await getServerSession(authOptions);
//   // if (!session) {
//   //   return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
//   // }

//   const { userId, updatedFields } = await req.json();

//   if (!userId || !updatedFields) {
//     return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//   }

//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const objectIdUserId = new ObjectId(userId);

//     const updatedUser = await db.collection('users').findOneAndUpdate(
//       { _id: objectIdUserId },
//       {
//         $set: updatedFields,
//       },
//       {
//         returnDocument: 'after',
//       }
//     );

//     return NextResponse.json(
//       {
//         updatedUser,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error during user information update:', error);
//     return NextResponse.json({ message: 'Server error during user information update' }, { status: 500 });
//   }
// }

// export async function DELETE(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
//   }

//   const { userId } = await req.json();

//   if (!userId) {
//     return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//   }

//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const objectIdUserId = new ObjectId(userId);

//     const deleteResult = await db.collection('users').deleteOne({ _id: objectIdUserId });

//     if (deleteResult.deletedCount === 1) {
//       return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
//     } else {
//       return NextResponse.json({ message: 'User not found' }, { status: 404 });
//     }
//   } catch (error) {
//     console.error('Error during user deletion:', error);
//     return NextResponse.json({ message: 'Server error during user deletion' }, { status: 500 });
//   }
// }
