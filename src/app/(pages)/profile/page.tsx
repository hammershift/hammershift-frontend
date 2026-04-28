import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import ProfileHero from "@/app/components/profile/ProfileHero";
import { fetchProfileSummary } from "@/lib/profile/summary";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile · Velocity Markets" };

interface UserHubFields {
  _id: unknown;
  fullName?: string;
  username?: string;
  createdAt?: Date;
  isInvited?: boolean;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  await connectToDB();
  const user = await Users.findOne({ email: session.user.email })
    .select("_id fullName username createdAt isInvited")
    .lean<UserHubFields | null>();

  if (!user || user.isInvited !== true) redirect("/");

  const summary = await fetchProfileSummary(String(user._id));

  const displayName = user.fullName || user.username || "Predictor";
  const handle = user.username || "predictor";

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10 space-y-6">
      <ProfileHero
        displayName={displayName}
        handle={handle}
        createdAt={user.createdAt ?? new Date()}
        stats={summary.stats}
      />

      {/* Bento grid — empty placeholder; tiles arrive in a later task */}
      <div
        className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5"
        data-testid="profile-bento"
      />
    </main>
  );
}
