/**
 * POST /api/waitlist/event-code
 *
 * Validates an event/booth code (e.g. "VELOCITY26") against EVENT_CODES_JSON
 * and, on match, sets an HttpOnly cookie that lets the next /api/waitlist/signup
 * call skip the queue and stamp utm.source for attribution.
 *
 * Body: { code: string }
 * 200  { ok: true, source: string }                 — cookie set
 * 400  { ok: false, error: "Invalid code" }
 * 429  { ok: false, error: "Too many attempts" }
 *
 * Rate-limited per IP so a booth tablet can be left unattended without
 * letting someone brute-force the code list.
 */

import { NextResponse } from "next/server";
import { hashIp } from "@/lib/waitlist/codes";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import {
  resolveEventCode,
  EVENT_PASS_COOKIE,
  EVENT_PASS_MAX_AGE_SEC,
} from "@/lib/waitlist/eventCodes";

export const dynamic = "force-dynamic";

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code : "";

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Code required" },
        { status: 400 }
      );
    }

    const salt = process.env.WAITLIST_IP_SALT || "default-salt";
    const ipHash = hashIp(getIp(req), salt);
    const rl = await checkRateLimit(ipHash, "event-code", {
      perHour: 10,
      perDay: 30,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts" },
        { status: 429 }
      );
    }

    const source = resolveEventCode(code);
    if (!source) {
      return NextResponse.json(
        { ok: false, error: "Invalid code" },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ ok: true, source });
    res.cookies.set({
      name: EVENT_PASS_COOKIE,
      value: source,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EVENT_PASS_MAX_AGE_SEC,
    });
    return res;
  } catch (err) {
    console.error("waitlist/event-code:", err);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
