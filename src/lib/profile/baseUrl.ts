import { headers } from "next/headers";

/**
 * Resolve the public origin for the current request so we can build
 * absolute URLs (share-card permalinks, OG image src, etc.) that match
 * the host the user is actually browsing.
 *
 * Works in dev, staging, Amplify, and behind any proxy that sets the
 * standard `x-forwarded-*` headers. Falls back to NEXTAUTH_URL or the
 * production domain when the request headers are missing (e.g. invoked
 * outside an HTTP context).
 *
 * Next 15 returns headers() as a Promise, so this fn is async.
 */
export async function resolveBaseUrl(): Promise<string> {
  const h = await headers();
  const forwardedProto = h.get("x-forwarded-proto");
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost ?? h.get("host");
  if (host) {
    const proto = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return process.env.NEXTAUTH_URL ?? "https://velocity-markets.com";
}
