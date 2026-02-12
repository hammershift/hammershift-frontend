import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import connectToDB from "@/lib/mongoose";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
export const dynamic = "force-dynamic";

// get winners, URL: /api/winnings?id=123
export async function GET(req: NextRequest) {
  //check if user is logged in
  const session = await getAuthSession();
  console.log("session:", session);
  if (!session) {
    console.log("Unauthorized: No session found");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = session.user.id;

  try {
    const client = await clientPromise;
    const db = client.db();

    const winnings = await db
      .collection("transactions")
      .countDocuments({
        $and: [
          { userID: new ObjectId(id as string) },
          { transactionType: "winnings" },
        ],
      });

    return NextResponse.json({ winnings: winnings || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" });
  }
}

export async function POST(req: NextRequest) {
  //check if user is logged in
  // const session = await getServerSession(authOptions);
  // console.log("session:", session)
  // if (!session) {
  //     console.log('Unauthorized: No session found');
  //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  const { key, value } = await req.json(); // get key and value from request body

  try {
    const client = await clientPromise;
    const db = client.db();

    const winnings = await db
      .collection("transactions")
      .countDocuments({
        $and: [
          { [key]: new ObjectId(value as string) },
          { transactionType: value },
        ],
      });

    return NextResponse.json({ winnings: winnings || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
