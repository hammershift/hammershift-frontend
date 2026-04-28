import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import Wallet from "@/models/wallet";

export interface ProfileSummary {
  stats: {
    predictions: number;
    accuracyPct: number;
    streak: number;
    earningsUsd: number;
    rank: number | null;
  };
}

interface AccuracyAggResult {
  _id: null;
  avg_accuracy: number;
}

interface WalletDoc {
  balance?: number;
}

/**
 * Server-only fetcher for the profile hub stat stripe.
 *
 * Pulls from existing collections directly via Mongoose — no HTTP round-trip.
 * Streak + rank are stubbed to 0 / null until later tasks wire them in.
 */
export async function fetchProfileSummary(userId: string): Promise<ProfileSummary> {
  await connectToDB();

  // The Predictions schema uses `user.userId` (nested ObjectId).
  // Run independent queries in parallel.
  const [predictionsCount, accuracyAgg, walletDoc] = await Promise.all([
    Predictions.countDocuments({ "user.userId": userId }),
    // Mirror the same accuracy formula used by /api/profile so values stay
    // consistent across surfaces. Predictions.score is a points value
    // (not 0..1), so we derive % accuracy from delta_from_actual / predictedPrice.
    Predictions.aggregate<AccuracyAggResult>([
      {
        $match: {
          "user.userId": userId,
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
    ]),
    Wallet.findOne({ userID: userId }).lean<WalletDoc | null>(),
  ]);

  const accuracyPct = accuracyAgg.length > 0 ? accuracyAgg[0].avg_accuracy ?? 0 : 0;

  // The wallet model only tracks current balance — no lifetime winnings field
  // exists yet. Fall back to 0; the EarningsTile will pick the right source
  // once it lands in a later task.
  const earningsUsd = 0;
  void walletDoc; // explicit no-op so the wallet read isn't accidentally dropped during refactors

  return {
    stats: {
      predictions: predictionsCount,
      accuracyPct,
      streak: 0,
      earningsUsd,
      rank: null,
    },
  };
}
