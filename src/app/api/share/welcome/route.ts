import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { ShareCard } from "@/models/shareCard.model";
import { generateShortCode } from "@/lib/waitlist/codes";

export const dynamic = "force-dynamic";

interface MongoDuplicateKeyError {
  code?: number;
}

function isDuplicateKeyError(err: unknown): err is MongoDuplicateKeyError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as MongoDuplicateKeyError).code === 11000
  );
}

export async function POST() {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const user = await Users.findById(userId).select(
      "username badges referralCode isInvited"
    );
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.isInvited !== true) {
      return NextResponse.json({ error: "Not invited" }, { status: 403 });
    }

    // Idempotent: if a welcome card already exists for this user, return it
    const existing = await ShareCard.findOne({
      userId: user._id,
      type: "welcome",
    }).select("shortCode");
    if (existing?.shortCode) {
      return NextResponse.json({ shortCode: existing.shortCode });
    }

    // Generate a unique shortCode with up to 5 retries against existing codes
    let shortCode: string | null = null;
    for (let i = 0; i < 5; i++) {
      const candidate = generateShortCode(6);
      // eslint-disable-next-line no-await-in-loop
      const collision = await ShareCard.findOne({ shortCode: candidate }).select("_id");
      if (!collision) {
        shortCode = candidate;
        break;
      }
    }
    if (!shortCode) {
      return NextResponse.json({ error: "Try again" }, { status: 500 });
    }

    const payload = {
      username: user.username,
      badges: Array.isArray(user.badges) ? user.badges : [],
      referralCode: user.referralCode ?? null,
    };

    try {
      await ShareCard.create({
        userId: user._id,
        type: "welcome",
        payload,
        shortCode,
      });
    } catch (err: unknown) {
      if (isDuplicateKeyError(err)) {
        return NextResponse.json({ error: "Try again" }, { status: 500 });
      }
      throw err;
    }

    return NextResponse.json({ shortCode });
  } catch (err) {
    console.error("/api/share/welcome error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
