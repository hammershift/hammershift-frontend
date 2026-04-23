import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { generateReferralCode } from "@/lib/waitlist/codes";

export const dynamic = "force-dynamic";

// Inlined rather than imported to keep this one-shot bootstrap route
// self-contained. Mirrors issue-magic-link/route.ts:10-23.
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(
    new Uint8Array(Buffer.from(a)),
    new Uint8Array(Buffer.from(b))
  );
}

export async function POST(req: Request) {
  // Do NOT leak which of (missing header / wrong header / missing env) failed.
  const secret = req.headers.get("x-internal-secret") ?? "";
  const expected = process.env.INTERNAL_API_SECRET ?? "";
  if (!secret || !expected || !secureCompare(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();

  // Resumable: only operate on users who haven't been bootstrapped yet.
  // If a prior run died partway through, a second call finishes the job
  // instead of being locked out by a blanket "already bootstrapped" 409.
  const users = await Users.find({ badges: { $ne: "founder" } }).lean();
  if (users.length === 0) {
    const existing = await Users.countDocuments({ badges: "founder" });
    return NextResponse.json(
      { error: "Already bootstrapped", founders: existing },
      { status: 409 }
    );
  }

  let updated = 0;
  let failed = 0;

  for (const u of users) {
    const userId = u._id;
    try {
      // Retry only on E11000 for the referralCode unique index. Any other
      // error propagates to the per-user catch so we don't silently swallow
      // bugs in the write path.
      let succeeded = false;
      for (let attempt = 0; attempt < 5 && !succeeded; attempt++) {
        const code = generateReferralCode();
        try {
          // $addToSet preserves any pre-existing badges (e.g. early_tester)
          // that may have been added to a user before this bootstrap runs.
          await Users.updateOne(
            { _id: userId },
            {
              $set: {
                isInvited: true,
                invitedVia: "founding",
                referralCode: code,
              },
              $addToSet: { badges: "founder" },
            }
          );
          succeeded = true;
        } catch (writeErr) {
          const errCode = (writeErr as { code?: number }).code;
          const keyPattern = (writeErr as {
            keyPattern?: Record<string, unknown>;
          }).keyPattern;
          if (
            errCode !== 11000 ||
            !keyPattern ||
            !("referralCode" in keyPattern)
          ) {
            throw writeErr;
          }
          // loop → regenerate referralCode
        }
      }
      if (!succeeded) {
        console.error(
          `bootstrap-founders: referralCode collision retries exhausted for user ${String(userId)}`
        );
        failed++;
      } else {
        updated++;
      }
    } catch (userErr) {
      console.error(
        `bootstrap-founders: failed to update user ${String(userId)}:`,
        userErr
      );
      failed++;
    }
  }

  return NextResponse.json({ ok: true, updated, failed });
}
