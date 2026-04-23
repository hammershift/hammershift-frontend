import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import GatePageClient from "./components/waitlist/GatePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getAuthSession();
  if (session?.user?.email) {
    await connectToDB();
    const user = await Users.findOne({ email: session.user.email })
      .lean<{ isInvited?: boolean; referralCode?: string } | null>();
    if (user?.isInvited) redirect("/app");
    return (
      <GatePageClient
        mode="waitlisted"
        email={session.user.email}
        referralCode={user?.referralCode}
      />
    );
  }
  return <GatePageClient mode="cold" />;
}
