import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { isRoleBypass } from "@/lib/gate";
import GatePageClient from "./components/waitlist/GatePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getAuthSession();
  if (session?.user?.email) {
    await connectToDB();
    const user = await Users.findOne({ email: session.user.email })
      .lean<{ isInvited?: boolean; role?: string; referralCode?: string } | null>();
    if (user?.isInvited === true || isRoleBypass(user?.role)) redirect("/app");
    return (
      <GatePageClient
        mode="waitlisted"
        email={session.user.email}
        referralCode={user?.referralCode}
      />
    );
  }
  // Pre-auth visitors who previously signed up get their dashboard back
  // via a cookie the form sets. Any invalid cookie falls through silently
  // to cold mode — WaitlistDashboard shows a benign error if /me 404s.
  const waitlistCode = (await cookies()).get("vm_waitlist_code")?.value;
  if (waitlistCode) {
    return <GatePageClient mode="waitlisted" referralCode={waitlistCode} />;
  }
  return <GatePageClient mode="cold" />;
}
