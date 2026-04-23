import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Prefixes that always pass through the gate.
//
// Public auth/waitlist endpoints power the gate itself (magic-link,
// verify, signup, cohort counter, etc.). API infra for payments,
// webhooks, cron and OG images must never be rewritten to "/".
const ALLOW_PREFIXES = [
  "/api/auth",
  "/api/waitlist",
  "/api/share",
  "/api/webhook", // Stripe webhook (external origin, must pass)
  "/api/cron", // cron endpoints (authed via x-cron-secret)
  "/api/health", // liveness/diagnostics
  "/api/og", // OG image generation
  "/s/", // public share unfurl pages
  "/_next",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
  "/og",
  "/legal",
  "/privacy",
  "/terms",
];

export async function middleware(req: NextRequest) {
  if (process.env.LAUNCH_GATE_ENABLED !== "true") return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname === "/") return NextResponse.next();
  for (const prefix of ALLOW_PREFIXES) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  // getToken will throw if NEXTAUTH_SECRET is missing — intended: surface misconfig.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.isInvited === true) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("gated", pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
