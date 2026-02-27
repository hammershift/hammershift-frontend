import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_API =
  process.env.BACKEND_API_URL ?? "https://main.d3bje0ak6q49bm.amplifyapp.com";

function getAttrValue(attributes: any[], key: string) {
  return attributes?.find((a: any) => a.key === key)?.value;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    // Try local DB first, then fall back to backend (auction may be in dev database)
    let auction: any = await Auctions.findById(params.id).lean().exec();

    if (!auction) {
      const backendRes = await fetch(
        `${BACKEND_API}/api/cars?auction_id=${params.id}`,
        { cache: "no-store", headers: { Accept: "application/json" } }
      );
      if (backendRes.ok) {
        const d = await backendRes.json();
        if (d && d._id) auction = d;
      }
    }

    if (!auction) {
      return NextResponse.json({ comps: [] });
    }

    const attrs = (auction as any).attributes ?? [];
    const make = getAttrValue(attrs, "make");

    if (!make) {
      return NextResponse.json({ comps: [] });
    }

    const comps = await Auctions.find({
      isActive: false,
      _id: { $ne: params.id },
      attributes: { $elemMatch: { key: "make", value: make } },
      "sort.price": { $gt: 0 },
    })
      .sort({ "sort.deadline": -1 })
      .limit(5)
      .lean()
      .exec();

    return NextResponse.json({ comps: JSON.parse(JSON.stringify(comps)) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
