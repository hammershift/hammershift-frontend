export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Stub: return default tier data until ladder system is fully built
  return NextResponse.json({
    tier: "Bronze",
    points: 0,
    rank: null,
    nextTier: "Silver",
    pointsToNext: 100,
  });
}
