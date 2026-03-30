export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate slug for last week's recap
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const slug = `bat-results-${lastWeek.toISOString().split("T")[0]}`;

  // Pre-warm ISR cache by fetching the page
  try {
    const BASE_URL =
      process.env.NEXT_PUBLIC_BASE_URL || "https://velocity-markets.com";
    await fetch(`${BASE_URL}/blog/${slug}`, { cache: "no-store" });
  } catch {
    // Non-fatal — page will generate on first request anyway
  }

  return NextResponse.json({ success: true, slug });
}
