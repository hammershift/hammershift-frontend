import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import { toObjectIdLike } from "@/lib/profile/ids";
import Users from "@/models/user.model";
import Tournaments from "@/models/tournament.model";
import { ShareCard } from "@/models/shareCard.model";
import TournamentFinishesFilterBar, {
  type TournamentFilter,
} from "@/app/components/profile/TournamentFinishesFilterBar";
import TournamentFinishRow, {
  type TournamentFinishRowItem,
} from "@/app/components/profile/TournamentFinishRow";
import SpokePagination from "@/app/components/profile/SpokePagination";
import SpokeEmptyNoMatches from "@/app/components/profile/SpokeEmptyNoMatches";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tournament finishes · Velocity Markets",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;
// Hard ceiling protects render latency; same convention as the predictions
// spoke. Users with >500 finishes will see only their most recent 500 in
// this view.
const MAX_FETCH = 500;

interface SearchParams {
  filter?: string;
  q?: string;
  page?: string;
}

interface UserGate {
  _id: unknown;
  isInvited?: boolean;
}

interface TournamentWinnerLite {
  userID?: unknown;
  rank?: number;
  prize?: number;
}

interface TournamentDocLite {
  _id: unknown;
  name?: string;
  winners?: TournamentWinnerLite[];
  endTime?: Date;
}

interface TournamentShareCardDoc {
  payload?: {
    tournamentId?: string;
    accuracy?: number;
  };
}

function parseFilter(value: string | undefined): TournamentFilter {
  if (value === "top10" || value === "wins") return value;
  return "all";
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProfileTournamentsPage({
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  await connectToDB();
  const user = await Users.findOne({ email: session.user.email })
    .select("_id isInvited")
    .lean<UserGate | null>();
  if (!user || user.isInvited !== true) redirect("/");

  const params = await searchParams;
  const filter = parseFilter(params.filter);
  const q = (params.q ?? "").trim();
  const qLower = q.toLowerCase();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const userId = String(user._id);
  const userIdAsObjectId = toObjectIdLike(userId);

  // Mongo-side: filter by user appearing in winners array. Filter dimension
  // (top10/wins) and search are applied in-memory because the user's rank
  // lives inside the winners array element and per-tournament accuracy
  // requires a join with share_cards.
  const [tournamentDocs, tournamentShareCards] = await Promise.all([
    Tournaments.find({ "winners.userID": userIdAsObjectId })
      .sort({ endTime: -1 })
      .limit(MAX_FETCH)
      .lean<TournamentDocLite[]>()
      .catch(() => [] as TournamentDocLite[]),
    ShareCard.find({ userId: userIdAsObjectId, type: "tournament" })
      .select("payload")
      .lean<TournamentShareCardDoc[]>()
      .catch(() => [] as TournamentShareCardDoc[]),
  ]);

  // Build accuracy map keyed by tournamentId. payload.accuracy is in [0, 1]
  // matching the share-unfurl convention; defensively handle either form.
  const accuracyById = new Map<string, number>();
  for (const c of tournamentShareCards ?? []) {
    const tid = c.payload?.tournamentId;
    const acc = c.payload?.accuracy;
    if (typeof tid === "string" && typeof acc === "number") {
      accuracyById.set(tid, acc);
    }
  }

  const enriched: TournamentFinishRowItem[] = (tournamentDocs ?? [])
    .map((t): TournamentFinishRowItem | null => {
      const winners = t.winners ?? [];
      const w = winners.find(
        (x) =>
          x.userID && String(x.userID) === userId && typeof x.rank === "number"
      );
      if (!w || typeof w.rank !== "number") return null;
      const tid = String(t._id);
      const accRaw = accuracyById.get(tid);
      const accuracyPct =
        typeof accRaw === "number"
          ? Math.round(accRaw <= 1 ? accRaw * 100 : accRaw)
          : null;
      return {
        id: tid,
        tournamentName: t.name ?? "Tournament",
        rank: w.rank,
        prize: typeof w.prize === "number" ? w.prize : 0,
        accuracyPct,
        endedAt: t.endTime ? new Date(t.endTime).toISOString() : null,
      };
    })
    .filter((x): x is TournamentFinishRowItem => x !== null);

  const totalUserFinishes = enriched.length;

  const filtered = enriched.filter((item) => {
    if (filter === "top10" && item.rank > 10) return false;
    if (filter === "wins" && item.rank !== 1) return false;
    if (qLower.length > 0 && !item.tournamentName.toLowerCase().includes(qLower)) {
      return false;
    }
    return true;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const buildPageHref = (targetPage: number): string => {
    const qs = new URLSearchParams();
    if (filter !== "all") qs.set("filter", filter);
    if (q.length > 0) qs.set("q", q);
    if (targetPage > 1) qs.set("page", String(targetPage));
    const s = qs.toString();
    return s ? `/profile/tournaments?${s}` : "/profile/tournaments";
  };

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
      <Link
        href="/profile"
        className="text-sm text-gray-400 transition hover:text-white"
      >
        &larr; Profile
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Tournament finishes</h1>
      <p className="mt-1 text-sm text-gray-400">
        Where you placed and how you scored.
      </p>

      <TournamentFinishesFilterBar filter={filter} q={q} />

      {totalUserFinishes === 0 ? (
        <EmptyNoFinishes />
      ) : pageItems.length === 0 ? (
        <SpokeEmptyNoMatches
          message="No finishes match this filter."
          clearHref="/profile/tournaments"
        />
      ) : (
        <>
          <ul
            data-testid="tournament-finishes-list"
            className="mt-6 flex flex-col gap-3"
          >
            {pageItems.map((item) => (
              <li key={item.id}>
                <TournamentFinishRow item={item} />
              </li>
            ))}
          </ul>

          <SpokePagination
            page={safePage}
            totalPages={totalPages}
            buildHref={buildPageHref}
          />
        </>
      )}
    </main>
  );
}

function EmptyNoFinishes() {
  return (
    <div className="mt-10 flex flex-col items-start gap-3 rounded-xl border border-white/[0.06] bg-[#13202D] p-6">
      <p className="text-sm text-gray-300">No tournament finishes yet.</p>
      <Link
        href="/tournaments"
        className="text-sm text-[#E94560] hover:underline"
      >
        Join a tournament &rarr;
      </Link>
    </div>
  );
}

