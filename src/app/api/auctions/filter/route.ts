import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Backend API hosts the correct database (dev). This route proxies to it so
// all client-side calls to /api/auctions/filter automatically hit the right data.
// Set BACKEND_API_URL in Amplify env vars if the backend URL changes.
const BACKEND_API =
  process.env.BACKEND_API_URL ??
  "https://main.d3bje0ak6q49bm.amplifyapp.com";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${BACKEND_API}/api/auctions/filter`);

    // Forward all query params from the original request
    req.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Always enforce publicOnly — this route is for public-facing listings
    url.searchParams.set("publicOnly", "true");

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`Backend API error: ${res.status} ${url}`);
      return NextResponse.json(
        { message: "Backend API error", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("auctions/filter proxy error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
