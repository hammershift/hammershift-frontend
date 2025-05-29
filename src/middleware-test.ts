import { NextResponse, NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/betterAuth";

type Session = typeof auth.$Infer.Session;
export async function middleware(req: NextRequest) {
  const session = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: req.nextUrl.origin,
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
  });

  if (!session || !session.data) {
    return NextResponse.redirect(new URL("/login_page", req.url));
  }

  return NextResponse.next({
    headers: {
      "x-user-id": session.data.user.id,
      "x-user-username": session.data.user.username!,
    },
  });
}

export const config = {
  matcher: [""],
};
