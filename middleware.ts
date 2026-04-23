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
  "/api/stripe", // Stripe checkout/onramp flows (handlers enforce their own auth)
  "/api/cron", // cron endpoints (authed via x-cron-secret)
  "/api/health", // liveness/diagnostics
  "/api/og", // OG image generation
  "/s/", // public share unfurl pages
  "/_next",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
  "/privacy_policy",
  "/terms_of_service",
];

const LAUNCH_GATE_ENABLED = /^(1|true|on|yes)$/i.test(process.env.LAUNCH_GATE_ENABLED ?? "");

export async function middleware(req: NextRequest) {
  if (!LAUNCH_GATE_ENABLED) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname === "/") return NextResponse.next();
  for (const prefix of ALLOW_PREFIXES) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  // Only require the secret once we actually need to verify a token.
  // getToken may silently return null when secret is missing, which would
  // gate every request including invited users — guard explicitly.
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required when LAUNCH_GATE_ENABLED is true");
  }
  const token = await getToken({ req, secret });
  if (token?.isInvited === true) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("gated", pathname + req.nextUrl.search);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf|eot|css|js|map|txt|xml|json|webmanifest)$).*)",
  ],
};
