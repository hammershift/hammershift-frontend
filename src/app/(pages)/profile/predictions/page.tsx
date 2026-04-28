import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { Predictions } from "@/models/predictions.model";
// Side-effect import: register the Auction schema with mongoose so populate
// can resolve the ref. Mirrors the pattern used in src/lib/profile/summary.ts.
import "@/models/auction.model";
import type { PredictionStatus } from "@/lib/profile/summary";
import PredictionsFilterBar, {
  type ModeFilter,
  type StatusFilter,
} from "@/app/components/profile/PredictionsFilterBar";
import PredictionRow, {
  type PredictionRowItem,
} from "@/app/components/profile/PredictionRow";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Predictions · Velocity Markets",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface SearchParams {
  status?: string;
  mode?: string;
  q?: string;
  page?: string;
}

interface UserGate {
  _id: unknown;
  isInvited?: boolean;
}

interface AuctionAttribute {
  key: string;
  value: unknown;
}

interface PopulatedAuction {
  _id?: unknown;
  auction_id?: string;
  title?: string;
  image?: string;
  images_list?: Array<{ src?: string }>;
  attributes?: AuctionAttribute[];
}

interface PopulatedPrediction {
  _id: unknown;
  predictedPrice?: number;
  score?: number;
  prize?: number;
  tournament_id?: unknown;
  createdAt?: Date;
  auction_id?: PopulatedAuction | null;
}

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function deriveStatus(p: PopulatedPrediction): PredictionStatus {
  if (typeof p.prize === "number" && p.prize > 0) return "won";
  if (typeof p.score === "number") return "lost";
  return "pending";
}

function deriveThumb(a: PopulatedAuction | null | undefined): string | undefined {
  if (!a) return undefined;
  if (a.images_list && a.images_list.length > 0 && a.images_list[0]?.src) {
    return a.images_list[0].src;
  }
  if (a.image) return a.image;
  return undefined;
}

function parseStatus(value: string | undefined): StatusFilter {
  if (value === "active" || value === "completed") return value;
  return "all";
}

function parseMode(value: string | undefined): ModeFilter {
  if (value === "free-play" || value === "tournament") return value;
  return "all";
}

function isCompletedStatus(status: PredictionStatus): boolean {
  return status === "won" || status === "lost";
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PredictionsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  await connectToDB();
  const user = await Users.findOne({ email: session.user.email })
    .select("_id isInvited")
    .lean<UserGate | null>();
  if (!user || user.isInvited !== true) redirect("/");

  const params = await searchParams;
  const status = parseStatus(params.status);
  const mode = parseMode(params.mode);
  const q = (params.q ?? "").trim();
  const qLower = q.toLowerCase();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const userId = String(user._id);

  // Mongo-side filtering: user + tournament-mode discriminator. Status & search
  // are applied in-memory after populate because they depend on populated
  // fields (auction title) and computed values (prize/score → status).
  const userIdAsObjectId = (() => {
    try {
      return new Types.ObjectId(userId);
    } catch {
      return userId;
    }
  })();

  const baseFilter: Record<string, unknown> = {
    "user.userId": userIdAsObjectId,
  };
  if (mode === "tournament") {
    baseFilter.tournament_id = { $exists: true, $ne: null };
  } else if (mode === "free-play") {
    baseFilter.tournament_id = { $in: [null, undefined] };
  }

  // Total count of user's predictions across all filters — used to decide
  // between "no predictions yet" vs "no matches".
  const [totalUserPredictions, rawDocs] = await Promise.all([
    Predictions.countDocuments({ "user.userId": userIdAsObjectId }).catch(
      () => 0
    ),
    Predictions.find(baseFilter)
      .sort({ createdAt: -1 })
      .populate({
        path: "auction_id",
        model: "Auction",
        select: "auction_id title image images_list",
      })
      .lean<PopulatedPrediction[]>()
      .catch(() => [] as PopulatedPrediction[]),
  ]);

  // Map → enrich → filter (status/search in-memory).
  const enriched: PredictionRowItem[] = rawDocs
    .map((p) => {
      if (!p.auction_id) return null;
      const a = p.auction_id;
      const predStatus = deriveStatus(p);
      const item: PredictionRowItem = {
        id: String(p._id),
        marketTitle: a.title ?? "Auction",
        thumbUrl: deriveThumb(a),
        yourCall: fmtUsd(Number(p.predictedPrice ?? 0)),
        status: predStatus,
        modeLabel: p.tournament_id ? "Tournament" : "Free-play",
        createdAt: (p.createdAt ?? new Date(0)).toISOString(),
        auctionHref: a.auction_id
          ? `/auction_details?id=${a.auction_id}`
          : undefined,
      };
      return item;
    })
    .filter((item): item is PredictionRowItem => item !== null);

  const filtered = enriched.filter((item) => {
    if (status === "active" && isCompletedStatus(item.status)) return false;
    if (status === "completed" && !isCompletedStatus(item.status)) return false;
    if (qLower.length > 0 && !item.marketTitle.toLowerCase().includes(qLower)) {
      return false;
    }
    return true;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const hasFiltersActive = status !== "all" || mode !== "all" || q.length > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
      <Link
        href="/profile"
        className="text-sm text-gray-400 transition hover:text-white"
      >
        &larr; Profile
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Your predictions</h1>
      <p className="mt-1 text-sm text-gray-400">
        Every market you&rsquo;ve called.
      </p>

      <PredictionsFilterBar status={status} mode={mode} q={q} />

      {totalUserPredictions === 0 ? (
        <EmptyNoPredictions />
      ) : pageItems.length === 0 ? (
        <EmptyNoMatches hasFiltersActive={hasFiltersActive} />
      ) : (
        <>
          <ul
            data-testid="predictions-list"
            className="mt-6 flex flex-col gap-3"
          >
            {pageItems.map((item) => (
              <li key={item.id}>
                <PredictionRow item={item} />
              </li>
            ))}
          </ul>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            status={status}
            mode={mode}
            q={q}
          />
        </>
      )}
    </main>
  );
}

function EmptyNoPredictions() {
  return (
    <div className="mt-10 flex flex-col items-start gap-3 rounded-xl border border-white/[0.06] bg-[#13202D] p-6">
      <p className="text-sm text-gray-300">No predictions yet.</p>
      <Link
        href="/markets"
        className="text-sm text-[#E94560] hover:underline"
      >
        Browse live markets &rarr;
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
      <p className="text-sm text-gray-300">
        No predictions match these filters.
      </p>
      {hasFiltersActive && (
        <Link
          href="/profile/predictions"
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
  status: StatusFilter;
  mode: ModeFilter;
  q: string;
}

function buildHref(
  page: number,
  status: StatusFilter,
  mode: ModeFilter,
  q: string
): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (mode !== "all") params.set("mode", mode);
  if (q.length > 0) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/profile/predictions?${qs}` : "/profile/predictions";
}

function Pagination({ page, totalPages, status, mode, q }: PaginationProps) {
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
            href={buildHref(page - 1, status, mode, q)}
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
            href={buildHref(page + 1, status, mode, q)}
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
