import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/betterAuth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // fetch all users without balance field
    const usersWithoutBalance = await db
      .collection("users")
      .find({ balance: { $exists: false } })
      .toArray();

    const numUsersWithoutBalance = usersWithoutBalance.length;
    if (numUsersWithoutBalance === 0) {
      console.log("All users have a balance");
      return NextResponse.json({ message: "All users have a balance" });
    }
    console.log(`${numUsersWithoutBalance} users found without a balance.`);

    usersWithoutBalance.forEach((user) => {
      console.log(`User ID: ${user._id}`);
    });

    return NextResponse.json({
      users: usersWithoutBalance.map((user) => user._id),
    });
  } catch (error) {
    console.error("GET Users without Balance - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const usersWithoutBalance = await db
      .collection("users")
      .find({ balance: { $exists: false } })
      .toArray();
    const numUsersWithoutBalance = usersWithoutBalance.length;

    if (numUsersWithoutBalance === 0) {
      console.log("All users have a balance.");
      return NextResponse.json({ message: "All users have a balance." });
    }

    console.log(`${numUsersWithoutBalance} users found without a balance.`);

    usersWithoutBalance.forEach((user) => {
      console.log(`User ID: ${user._id}`);
    });

    const bulkOperations = usersWithoutBalance.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { balance: 100 } },
      },
    }));

    if (bulkOperations.length > 0) {
      await db.collection("users").bulkWrite(bulkOperations);
      console.log(
        `${numUsersWithoutBalance} users updated with a balance of 100.`
      );
    }

    return NextResponse.json({
      users: usersWithoutBalance.map((user) => user._id),
    });
  } catch (error) {
    console.error("POST Users without Balance - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
