import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import Tournaments from "@/models/tournament.model";
import { ShareCard } from "@/models/shareCard.model";
import TournamentFinishesFilterBar, {
  type TournamentFilter,
} from "@/app/components/profile/TournamentFinishesFilterBar";
import TournamentFinishRow, {
  type TournamentFinishRowItem,
} from "@/app/components/profile/TournamentFinishRow";

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

function toObjectIdLike(id: string): unknown {
  try {
    return new Types.ObjectId(id);
  } catch {
    return id;
  }
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

  const hasFiltersActive = filter !== "all" || q.length > 0;

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
        <EmptyNoMatches hasFiltersActive={hasFiltersActive} />
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

          <Pagination
            page={safePage}
            totalPages={totalPages}
            filter={filter}
            q={q}
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

function EmptyNoMatches({
  hasFiltersActive,
}: {
  hasFiltersActive: boolean;
}) {
  return (
    <div className="mt-10 flex flex-col items-start gap-3 rounded-xl border border-white/[0.06] bg-[#13202D] p-6">
      <p className="text-sm text-gray-300">No finishes match this filter.</p>
      {hasFiltersActive && (
        <Link
          href="/profile/tournaments"
          className="text-sm text-[#E94560] hover:underline"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  filter: TournamentFilter;
  q: string;
}

function buildHref(
  page: number,
  filter: TournamentFilter,
  q: string
): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (q.length > 0) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/profile/tournaments?${qs}` : "/profile/tournaments";
}

function Pagination({ page, totalPages, filter, q }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const baseBtn =
    "inline-flex items-center rounded-lg border border-white/[0.06] bg-[#13202D] px-3 py-1.5 text-sm transition";
  const enabledBtn = `${baseBtn} text-white hover:border-white/[0.12]`;
  const disabledBtn = `${baseBtn} text-gray-600 cursor-not-allowed`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between"
    >
      <div className="text-xs text-gray-500">
        Page{" "}
        <span className="font-mono tabular-nums text-gray-300">{page}</span>{" "}
        of{" "}
        <span className="font-mono tabular-nums text-gray-300">
          {totalPages}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span aria-disabled="true" className={disabledBtn}>
            &larr; Previous
          </span>
        ) : (
          <Link
            href={buildHref(page - 1, filter, q)}
            className={enabledBtn}
            rel="prev"
          >
            &larr; Previous
          </Link>
        )}
        {nextDisabled ? (
          <span aria-disabled="true" className={disabledBtn}>
            Next &rarr;
          </span>
        ) : (
          <Link
            href={buildHref(page + 1, filter, q)}
            className={enabledBtn}
            rel="next"
          >
            Next &rarr;
          </Link>
        )}
      </div>
    </nav>
  );
}
