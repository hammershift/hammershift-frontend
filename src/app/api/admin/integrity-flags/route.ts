/**
 * GET /api/admin/integrity-flags
 *
 * Returns the current integrity flag review queue for the admin dashboard.
 * Requires an authenticated admin session.
 *
 * Query params:
 *   severity  - "HIGH" | "MEDIUM" | "LOW" (optional, returns all if omitted)
 *   resolved  - "true" | "false" (default: "false" — show unresolved only)
 *   flagType  - one of the FlagType values (optional)
 *   limit     - number, default 50, max 200
 *   page      - number, default 1
 *
 * Also exposes:
 *   PATCH /api/admin/integrity-flags/[flagId] — mark a flag as resolved
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import connectToDB from "@/lib/mongoose";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

const VALID_SEVERITIES = ["HIGH", "MEDIUM", "LOW"] as const;
const VALID_FLAG_TYPES = [
  "POSITION_CAP_APPROACHED",
  "LATE_SNIPE",
  "RAPID_TRADING",
  "OPPOSING_SIDES_SAME_IP",
  "RATE_LIMIT_HIT",
  "ORACLE_DELAY",
  "ORACLE_FAILED",
  "RESOLUTION_DISPUTED",
] as const;

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || !["admin", "superadmin"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;

  const severity = searchParams.get("severity");
  const resolvedParam = searchParams.get("resolved") ?? "false";
  const flagType = searchParams.get("flagType");
  const limitParam = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  const limit = Math.min(isNaN(limitParam) ? DEFAULT_LIMIT : limitParam, MAX_LIMIT);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    resolved: resolvedParam === "true",
  };

  if (severity && VALID_SEVERITIES.includes(severity as (typeof VALID_SEVERITIES)[number])) {
    filter.severity = severity;
  }

  if (flagType && VALID_FLAG_TYPES.includes(flagType as (typeof VALID_FLAG_TYPES)[number])) {
    filter.flagType = flagType;
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const [flags, total] = await Promise.all([
    db
      .collection("polygon_flags")
      .find(filter)
      .sort({ severity: -1, createdAt: -1 })  // HIGH first, then newest
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("polygon_flags").countDocuments(filter),
  ]);

  // Attach summary counts for the dashboard header widget
  const [highCount, mediumCount] = await Promise.all([
    db.collection("polygon_flags").countDocuments({ resolved: false, severity: "HIGH" }),
    db.collection("polygon_flags").countDocuments({ resolved: false, severity: "MEDIUM" }),
  ]);

  return NextResponse.json({
    flags,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    summary: {
      unresolvedHigh: highCount,
      unresolvedMedium: mediumCount,
    },
  });
}

/**
 * PATCH /api/admin/integrity-flags
 * Body: { flagId: string, resolvedBy: string }
 * Marks a flag as resolved.
 */
export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || !["admin", "superadmin"].includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let flagId: string;
  let resolvedBy: string;

  try {
    const body = await req.json();
    flagId = body.flagId;
    resolvedBy = body.resolvedBy ?? (session.user as { id?: string }).id ?? "unknown";
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  let flagObjectId: ObjectId;
  try {
    flagObjectId = new ObjectId(flagId);
  } catch {
    return NextResponse.json({ message: "Invalid flagId." }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  // Attempt to cast resolvedBy to ObjectId; fall back to storing as string if not a valid hex ID
  let resolvedByValue: ObjectId | string;
  try {
    resolvedByValue = new ObjectId(resolvedBy);
  } catch {
    resolvedByValue = resolvedBy; // store as string (e.g., email or "unknown")
  }

  const result = await db.collection("polygon_flags").findOneAndUpdate(
    { _id: flagObjectId, resolved: false },
    {
      $set: {
        resolved: true,
        resolvedBy: resolvedByValue,
        resolvedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json(
      { message: "Flag not found or already resolved." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, flag: result });
}
