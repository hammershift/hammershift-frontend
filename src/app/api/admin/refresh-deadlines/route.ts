import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Protect with ADMIN_REFRESH_SECRET env var (set in Amplify / .env.local)
const REFRESH_SECRET = process.env.ADMIN_REFRESH_SECRET;

/**
 * Fetch the auction end time from a BaT listing page.
 * Tries three patterns in the raw HTML (BaT renders auction metadata
 * server-side so it's present before JS execution):
 *   1. data-until-expiration="<unix_seconds>" on the countdown span
 *   2. "availabilityEnds":"<ISO string>" in JSON-LD structured data
 *   3. end_time_unixstamp or end_time in batdatalayer / window.BATdataLayer
 */
async function fetchBatDeadline(pageUrl: string): Promise<Date | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VelocityMarkets/1.0; +https://velocity-markets.com)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Pattern 1: countdown span with Unix timestamp (seconds)
    const unixAttr = html.match(/data-until-expiration="(\d+)"/);
    if (unixAttr) return new Date(parseInt(unixAttr[1]) * 1000);

    // Pattern 2: JSON-LD availabilityEnds ISO date
    const jsonLd = html.match(/"availabilityEnds"\s*:\s*"([^"]+)"/);
    if (jsonLd) return new Date(jsonLd[1]);

    // Pattern 3: batdatalayer end_time_unixstamp or end_time
    const unixField = html.match(/end_time_unixstamp["']?\s*:\s*(\d+)/);
    if (unixField) return new Date(parseInt(unixField[1]) * 1000);

    const isoField = html.match(/end_time["']?\s*:\s*["']([^"']+)["']/);
    if (isoField) return new Date(isoField[1]);

    return null;
  } catch {
    return null;
  }
}

/**
 * POST /api/admin/refresh-deadlines
 *
 * Re-fetches BaT listing pages for active auctions with stale or missing
 * sort.deadline fields and updates the database.
 *
 * Query params:
 *   limit  — max auctions to process per call (default 10)
 *   secret — auth secret (or pass as x-refresh-secret header)
 *
 * Returns a summary of what was updated.
 */
export async function POST(req: NextRequest) {
  // Auth check
  const secret =
    req.headers.get("x-refresh-secret") ??
    req.nextUrl.searchParams.get("secret");
  if (REFRESH_SECRET && secret !== REFRESH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 10, 50);

  try {
    await connectToDB();
    const now = new Date();

    // Find active BaT auctions whose deadline is missing or already in the past
    const stale = await Auctions.find({
      isActive: true,
      source_badge: "bat",
      $or: [{ "sort.deadline": null }, { "sort.deadline": { $lt: now } }],
    })
      .select("_id title page_url sort")
      .limit(limit)
      .lean();

    const results: {
      _id: string;
      title: string;
      status: "updated" | "already_ended" | "parse_failed";
      oldDeadline: Date | null;
      newDeadline: Date | null;
    }[] = [];

    for (const auction of stale) {
      const a = auction as any;
      const oldDeadline = a.sort?.deadline ?? null;
      const newDeadline = await fetchBatDeadline(a.page_url);

      if (newDeadline && newDeadline > now) {
        await Auctions.updateOne(
          { _id: auction._id },
          { $set: { "sort.deadline": newDeadline } }
        );
        results.push({
          _id: auction._id.toString(),
          title: a.title,
          status: "updated",
          oldDeadline,
          newDeadline,
        });
      } else {
        results.push({
          _id: auction._id.toString(),
          title: a.title,
          status: newDeadline ? "already_ended" : "parse_failed",
          oldDeadline,
          newDeadline,
        });
      }

      // Polite rate limit — avoid hammering BaT
      await new Promise((r) => setTimeout(r, 600));
    }

    return NextResponse.json({
      processed: results.length,
      updated: results.filter((r) => r.status === "updated").length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
