import connectToDB from "@/lib/mongoose";
import { toObjectIdLike } from "@/lib/profile/ids";
import { Predictions } from "@/models/predictions.model";
import Streak from "@/models/streak.model";
import Badge from "@/models/badge.model";
import { ShareCard } from "@/models/shareCard.model";
import Transaction from "@/models/transaction";
import Tournaments from "@/models/tournament.model";
import { BadgeType } from "@/types/badge-types";

// Side-effect import: ensure the Auction model is registered with mongoose
// before populate("auction_id", …) runs. Without it the populate will throw
// MissingSchemaError when this module is hit in isolation.
import "@/models/auction.model";

export type PredictionStatus = "won" | "lost" | "pending";

export interface RecentPrediction {
  id: string;
  marketTitle: string;
  thumbUrl?: string;
  yourCall: string;
  status: PredictionStatus;
}

export interface RecentBadge {
  id: string;
  name: string;
  earnedAt: Date;
}

export interface ShareCardLite {
  id: string;
  type: "welcome" | "winner" | "tournament";
  shortCode: string;
  createdAt: Date;
}

export interface EarningsSeriesPoint {
  d: string;
  v: number;
}

export interface TournamentFinish {
  id: string;
  placement: number;
  tournamentName: string;
  accuracyPct: number;
}

export interface ProfileSummary {
  stats: {
    predictions: number;
    accuracyPct: number;
    streak: number;
    earningsUsd: number;
    rank: number | null;
  };
  recent: RecentPrediction[];
  totalPredictions: number;
  streak: { current: number; longest: number };
  badges: RecentBadge[];
  cards: ShareCardLite[];
  earnings: {
    lifetimeUsd: number;
    thisMonthUsd: number;
    series: EarningsSeriesPoint[];
  };
  tournamentFinishes: TournamentFinish[];
}

interface AccuracyAggResult {
  _id: null;
  avg_accuracy: number;
}

interface StreakDoc {
  current_streak?: number;
  longest_streak?: number;
}

interface BadgeDoc {
  _id: unknown;
  badge_type: string;
  earned_at?: Date;
}

interface ShareCardDocLite {
  _id: unknown;
  type: "welcome" | "winner" | "tournament";
  shortCode: string;
  createdAt: Date;
}

interface TournamentShareCardDoc {
  payload?: {
    tournamentId?: string;
    accuracy?: number;
  };
}

interface AuctionAttribute {
  key: string;
  value: unknown;
}

interface PopulatedAuction {
  _id?: unknown;
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
  delta_from_actual?: number;
  createdAt?: Date;
  auction_id?: PopulatedAuction | null;
}

interface TxAggDoc {
  _id: string;
  total: number;
}

interface TournamentWinner {
  userID?: unknown;
  rank?: number;
  prize?: number;
}

interface TournamentDocLite {
  _id: unknown;
  name?: string;
  winners?: TournamentWinner[];
  endTime?: Date;
}

const BADGE_LABELS: Record<BadgeType, string> = {
  [BadgeType.FIRST_PREDICTION]: "First Prediction",
  [BadgeType.FIRST_WIN]: "First Win",
  [BadgeType.HOT_START]: "Hot Start",
  [BadgeType.ON_FIRE]: "On Fire",
  [BadgeType.UNSTOPPABLE]: "Unstoppable",
  [BadgeType.LEGEND]: "Legend",
  [BadgeType.TOURNAMENT_ROOKIE]: "Tournament Rookie",
  [BadgeType.TOURNAMENT_CHAMPION]: "Tournament Champion",
  [BadgeType.SHARPSHOOTER]: "Sharpshooter",
  [BadgeType.CENTURION]: "Centurion",
  [BadgeType.TOP_10]: "Top 10",
};

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function deriveStatus(p: PopulatedPrediction): PredictionStatus {
  // `prize > 0` is the canonical "won" signal — set by settle-markets and
  // the tournamentWinner cron when a winning transaction is created.
  if (typeof p.prize === "number" && p.prize > 0) return "won";
  // `score` is set during scoring. If scored without prize → lost.
  if (typeof p.score === "number") return "lost";
  // Otherwise the auction hasn't settled yet for this prediction.
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

/** ISO date stamp truncated to day in UTC, e.g. "2026-04-28". */
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Server-only fetcher for the profile hub.
 *
 * Pulls from existing collections directly via Mongoose — no HTTP round-trip.
 * Failures from any individual section are silenced into zero/empty values
 * so a flaky model load doesn't take the whole hub down.
 */
export async function fetchProfileSummary(userId: string): Promise<ProfileSummary> {
  await connectToDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const [
    predictionsCount,
    accuracyAgg,
    lifetimeEarningsAgg,
    recentPredictionsRaw,
    streakDoc,
    badgeDocs,
    cardDocs,
    monthEarningsAgg,
    seriesAgg,
    tournamentDocs,
    tournamentShareCards,
  ] = await Promise.all([
    Predictions.countDocuments({ "user.userId": userId }).catch(() => 0),
    Predictions.aggregate<AccuracyAggResult>([
      {
        $match: {
          "user.userId": toObjectIdLike(userId),
          score: { $exists: true, $ne: null },
          delta_from_actual: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avg_accuracy: {
            $avg: {
              $max: [
                0,
                {
                  $subtract: [
                    100,
                    {
                      $multiply: [
                        {
                          $abs: {
                            $divide: [
                              "$delta_from_actual",
                              {
                                $cond: [
                                  { $eq: ["$predictedPrice", 0] },
                                  1,
                                  "$predictedPrice",
                                ],
                              },
                            ],
                          },
                        },
                        100,
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    ]).catch(() => [] as AccuracyAggResult[]),
    // Lifetime winnings — sum every "+ winnings" transaction for this user.
    Transaction.aggregate<{ _id: null; total: number }>([
      {
        $match: {
          userID: toObjectIdLike(userId),
          transactionType: "winnings",
          type: "+",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).catch(() => [] as Array<{ _id: null; total: number }>),
    Predictions.find({ "user.userId": userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: "auction_id",
        model: "Auction",
        select: "title image images_list",
      })
      .lean<PopulatedPrediction[]>()
      .catch(() => [] as PopulatedPrediction[]),
    Streak.findOne({ user_id: userId }).lean<StreakDoc | null>().catch(() => null),
    Badge.find({ user_id: userId })
      .sort({ earned_at: -1 })
      .limit(3)
      .lean<BadgeDoc[]>()
      .catch(() => [] as BadgeDoc[]),
    ShareCard.find({ userId })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean<ShareCardDocLite[]>()
      .catch(() => [] as ShareCardDocLite[]),
    // This-month winnings
    Transaction.aggregate<{ _id: null; total: number }>([
      {
        $match: {
          userID: toObjectIdLike(userId),
          transactionType: "winnings",
          type: "+",
          transactionDate: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).catch(() => [] as Array<{ _id: null; total: number }>),
    // 7-day series
    Transaction.aggregate<TxAggDoc>([
      {
        $match: {
          userID: toObjectIdLike(userId),
          transactionType: "winnings",
          type: "+",
          transactionDate: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$transactionDate" },
          },
          total: { $sum: "$amount" },
        },
      },
    ]).catch(() => [] as TxAggDoc[]),
    // Tournament finishes — read from completed tournaments where user is a winner.
    Tournaments.find({
      "winners.userID": toObjectIdLike(userId),
    })
      .sort({ endTime: -1 })
      .limit(3)
      .lean<TournamentDocLite[]>()
      .catch(() => [] as TournamentDocLite[]),
    // Tournament-type share cards carry the user's per-tournament accuracy
    // in payload.accuracy (0..1). Join on payload.tournamentId.
    ShareCard.find({ userId, type: "tournament" })
      .select("payload")
      .lean<TournamentShareCardDoc[]>()
      .catch(() => [] as TournamentShareCardDoc[]),
  ]);

  const accuracyPct = accuracyAgg.length > 0 ? accuracyAgg[0].avg_accuracy ?? 0 : 0;

  const earningsUsd =
    lifetimeEarningsAgg.length > 0 ? Math.round(lifetimeEarningsAgg[0].total) : 0;

  const recent: RecentPrediction[] = (recentPredictionsRaw ?? []).map((p) => {
    const auction = p.auction_id ?? null;
    return {
      id: String(p._id),
      marketTitle: auction?.title ?? "Auction",
      thumbUrl: deriveThumb(auction),
      yourCall: fmtUsd(Number(p.predictedPrice ?? 0)),
      status: deriveStatus(p),
    };
  });

  const streakSummary = {
    current: Number(streakDoc?.current_streak ?? 0),
    longest: Number(streakDoc?.longest_streak ?? 0),
  };

  const badges: RecentBadge[] = (badgeDocs ?? []).map((b) => ({
    id: String(b._id),
    name: BADGE_LABELS[b.badge_type as BadgeType] ?? b.badge_type,
    earnedAt: b.earned_at ?? new Date(0),
  }));

  const cards: ShareCardLite[] = (cardDocs ?? []).map((c) => ({
    id: String(c._id),
    type: c.type,
    shortCode: c.shortCode,
    createdAt: c.createdAt,
  }));

  const thisMonthUsd =
    monthEarningsAgg.length > 0 ? Math.round(monthEarningsAgg[0].total) : 0;

  const series = buildSevenDaySeries(seriesAgg, sevenDaysAgo);

  const tournamentFinishes = buildTournamentFinishes(
    tournamentDocs,
    tournamentShareCards,
    userId
  );

  return {
    stats: {
      predictions: predictionsCount,
      accuracyPct,
      streak: streakSummary.current,
      earningsUsd,
      rank: null,
    },
    recent,
    totalPredictions: predictionsCount,
    streak: streakSummary,
    badges,
    cards,
    earnings: {
      lifetimeUsd: earningsUsd,
      thisMonthUsd,
      series,
    },
    tournamentFinishes,
  };
}

/**
 * Build a 7-element series indexed by day. Missing days fill in as zero.
 * Output is ordered oldest → newest so a sparkline reads left-to-right.
 */
function buildSevenDaySeries(
  rows: TxAggDoc[],
  startDay: Date
): EarningsSeriesPoint[] {
  const byDay = new Map<string, number>();
  for (const r of rows) byDay.set(r._id, Math.round(r.total));

  const out: EarningsSeriesPoint[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDay);
    day.setUTCDate(day.getUTCDate() + i);
    const key = ymd(day);
    out.push({ d: key, v: byDay.get(key) ?? 0 });
  }
  return out;
}

function buildTournamentFinishes(
  tournaments: TournamentDocLite[],
  shareCards: TournamentShareCardDoc[],
  userId: string
): TournamentFinish[] {
  // tournamentWinner cron writes per-user `share_cards` with payload.accuracy
  // in [0, 1]. Join on payload.tournamentId so the displayed accuracy matches
  // the share-unfurl exactly. If no card exists (e.g. a placement created
  // before the share-card hook landed), accuracy falls back to 0.
  const accuracyById = new Map<string, number>();
  for (const c of shareCards ?? []) {
    const tid = c.payload?.tournamentId;
    const acc = c.payload?.accuracy;
    if (typeof tid === "string" && typeof acc === "number") {
      accuracyById.set(tid, acc);
    }
  }

  const out: TournamentFinish[] = [];
  for (const t of tournaments ?? []) {
    const winners = t.winners ?? [];
    const w = winners.find(
      (x) => x.userID && String(x.userID) === userId && typeof x.rank === "number"
    );
    if (!w || typeof w.rank !== "number") continue;
    const tid = String(t._id);
    const acc01 = accuracyById.get(tid) ?? 0;
    out.push({
      id: tid,
      placement: w.rank,
      tournamentName: t.name ?? "Tournament",
      accuracyPct: Math.round(acc01 * 100),
    });
  }
  return out;
}
