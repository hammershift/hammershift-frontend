import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = req.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  await connectToDB();
  const entry = await WaitlistEntry.findOne({ email });
  if (!entry || !entry.invitedAt) {
    return NextResponse.json({ error: "Not approved" }, { status: 403 });
  }

  const token = randomUUID().replace(/-/g, "");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const url = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${token}`;

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  await db.collection("verification_tokens").insertOne({ identifier: email, token, expires });

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST!,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
    auth: { user: process.env.EMAIL_SERVER_USER!, pass: process.env.EMAIL_SERVER_PASSWORD! },
  });
  await transport.sendMail({
    to: email,
    from: process.env.EMAIL_FROM!,
    subject: "You're in. Welcome to Velocity Markets.",
    html: renderInviteEmail(url),
    text: `Welcome to Velocity Markets. Click here to sign in: ${url}`,
  });

  await WaitlistEntry.updateOne({ _id: entry._id }, { $set: { inviteEmailSentAt: new Date() } });
  return NextResponse.json({ ok: true });
}

function renderInviteEmail(url: string): string {
  return `<!doctype html><html><body style="font-family:-apple-system,sans-serif;background:#0A0A1A;color:#fff;padding:32px">
    <h1 style="color:#E94560">You're in.</h1>
    <p>Welcome to Velocity Markets. Predict auction hammer prices. Win real money.</p>
    <p><a href="${url}" style="background:#E94560;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Claim your account</a></p>
    <p style="color:#888;font-size:12px">Link expires in 24 hours. If you didn't request this, ignore this email.</p>
  </body></html>`;
}
