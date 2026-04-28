import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import ProfileHero from "@/app/components/profile/ProfileHero";
import RecentPredictionsTile from "@/app/components/profile/RecentPredictionsTile";
import StreakBadgesTile from "@/app/components/profile/StreakBadgesTile";
import ShareCardsTile from "@/app/components/profile/ShareCardsTile";
import EarningsTile from "@/app/components/profile/EarningsTile";
import TournamentFinishesTile from "@/app/components/profile/TournamentFinishesTile";
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

async function resolveBaseUrl(): Promise<string> {
  // Pick the public origin from request headers so share-card URLs match
  // the host the user is actually browsing — works in dev, staging,
  // Amplify, and behind whatever proxy is in front. Next 15 returns
  // headers() as a Promise, so this fn is async.
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

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  await connectToDB();
  const user = await Users.findOne({ email: session.user.email })
    .select("_id fullName username createdAt isInvited")
    .lean<UserHubFields | null>();

  if (!user || user.isInvited !== true) redirect("/");

  const summary = await fetchProfileSummary(String(user._id));
  const baseUrl = await resolveBaseUrl();

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

      <div
        className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5"
        data-testid="profile-bento"
      >
        <RecentPredictionsTile
          recent={summary.recent}
          totalCount={summary.totalPredictions}
        />
        <StreakBadgesTile
          current={summary.streak.current}
          longest={summary.streak.longest}
          badges={summary.badges}
        />
        <ShareCardsTile cards={summary.cards} baseUrl={baseUrl} />
        <EarningsTile
          lifetimeUsd={summary.earnings.lifetimeUsd}
          thisMonthUsd={summary.earnings.thisMonthUsd}
          series={summary.earnings.series}
        />
        <TournamentFinishesTile finishes={summary.tournamentFinishes} />
      </div>
    </main>
  );
}
