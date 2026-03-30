import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";

export const dynamic = "force-dynamic";

/**
 * GET /api/virtual-balance
 * Returns the current user's virtual balance (Velocity Points).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const user = await Users.findById(session.user.id).select(
    "virtualBalance virtualWagered virtualWon"
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    virtualBalance: user.virtualBalance ?? 10000,
    virtualWagered: user.virtualWagered ?? 0,
    virtualWon: user.virtualWon ?? 0,
  });
}
