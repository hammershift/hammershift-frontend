// Server-only gate guard for gated route subtrees.
//
// Returns either `null` (caller renders the real children) or a JSX
// element that should be rendered IN PLACE OF the children (the cold/
// waitlisted gate). We deliberately AVOID `redirect()` because the
// site's global Sentry error boundary catches the NEXT_REDIRECT throw
// in some Amplify Lambda configurations, producing a 200 + __next_error__
// response instead of a 307. Rendering the gate inline mirrors the
// pattern that already works in `src/app/page.tsx`.
//
// Skips when `LAUNCH_GATE_ENABLED` is falsy so dev / staging behave
// as before. Defense-in-depth: works even if middleware doesn't run
// (Amplify Hosting silently drops Next.js middleware on some runtimes).

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { isRoleBypass } from "@/lib/gate";
import GatePageClient from "@/app/components/waitlist/GatePageClient";

interface UserGateFields {
  isInvited?: boolean;
  role?: string;
  referralCode?: string;
}

export async function gateOrPass(): Promise<React.ReactElement | null> {
  const enabled = /^(1|true|on|yes)$/i.test(process.env.LAUNCH_GATE_ENABLED ?? "");
  if (!enabled) return null;

  let email: string | null | undefined = null;
  try {
    const session = (await getServerSession(authOptions)) as
      | { user?: { email?: string | null } }
      | null;
    email = session?.user?.email;
  } catch {
    email = null;
  }

  if (!email) {
    const waitlistCode = (await cookies()).get("vm_waitlist_code")?.value;
    if (waitlistCode) {
      return <GatePageClient mode="waitlisted" referralCode={waitlistCode} />;
    }
    return <GatePageClient mode="cold" />;
  }

  let user: UserGateFields | null = null;
  try {
    await connectToDB();
    user = await Users.findOne({ email })
      .select("isInvited role referralCode")
      .lean<UserGateFields | null>();
  } catch {
    user = null;
  }

  if (user?.isInvited === true) return null;
  if (isRoleBypass(user?.role)) return null;

  return (
    <GatePageClient
      mode="waitlisted"
      email={email}
      referralCode={user?.referralCode}
    />
  );
}
