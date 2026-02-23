import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getAttrValue(attributes: any[], key: string) {
  return attributes?.find((a: any) => a.key === key)?.value;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const auction = await Auctions.findById(params.id).lean().exec();
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
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
