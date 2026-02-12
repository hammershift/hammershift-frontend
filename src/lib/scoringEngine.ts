import connectToDB from "@/lib/mongoose";
import Streak from "@/models/streak.model";
import { Types } from "mongoose";

interface ScoringBonuses {
  early_bird: boolean;
  streak_bonus: boolean;
  bullseye: boolean;
  tournament_multiplier: number;
}

interface ScoringResult {
  base_score: number;
  bonuses: ScoringBonuses;
  total_score: number;
  delta_from_actual: number;
  accuracy_pct: number;
}

/**
 * Calculates prediction score using v2 scoring formula with bonuses.
 * Formula:
 *   base_score = max(0, 1000 × (1 - |predicted - actual| / actual))
 *   Bonuses:
 *     - early_bird: +50 if predicted > 48 hours before auction end
 *     - streak_bonus: +25 if user's current_streak ≥ 5
 *     - bullseye: +200 if within 1% of actual price
 *     - tournament_multiplier: base_score × 1.5 if tournament_id exists
 *   total_score = (base_score × tournament_multiplier) + early_bird + streak_bonus + bullseye
 *
 * @param predictedPrice - User's predicted price
 * @param actualPrice - Actual final auction price
 * @param predictionDate - When the prediction was made
 * @param auctionEndDate - When the auction ended
 * @param userId - User's ObjectId as string
 * @param tournamentId - Optional tournament ObjectId as string
 * @returns ScoringResult with base score, bonuses, and total
 */
export async function calculateScoreV2(
  predictedPrice: number,
  actualPrice: number,
  predictionDate: Date,
  auctionEndDate: Date,
  userId: string,
  tournamentId?: string
): Promise<ScoringResult> {
  try {
    await connectToDB();

    // Calculate base score
    const delta = Math.abs(predictedPrice - actualPrice);
    const errorRatio = delta / actualPrice;
    const base_score = Math.max(0, 1000 * (1 - errorRatio));

    // Calculate accuracy percentage
    const accuracy_pct = Math.max(0, (1 - errorRatio) * 100);

    // Initialize bonuses
    const bonuses: ScoringBonuses = {
      early_bird: false,
      streak_bonus: false,
      bullseye: false,
      tournament_multiplier: tournamentId ? 1.5 : 1.0,
    };

    let bonus_points = 0;

    // Check early bird bonus: predicted > 48 hours before auction end
    const hoursDifference =
      (auctionEndDate.getTime() - predictionDate.getTime()) / (1000 * 60 * 60);
    if (hoursDifference > 48) {
      bonuses.early_bird = true;
      bonus_points += 50;
    }

    // Check streak bonus: current_streak ≥ 5
    const userObjectId = new Types.ObjectId(userId);
    const streakDoc = await Streak.findOne({ user_id: userObjectId });
    if (streakDoc && streakDoc.current_streak >= 5) {
      bonuses.streak_bonus = true;
      bonus_points += 25;
    }

    // Check bullseye bonus: within 1% of actual price
    if (errorRatio <= 0.01) {
      bonuses.bullseye = true;
      bonus_points += 200;
    }

    // Calculate total score with tournament multiplier and bonuses
    const total_score =
      base_score * bonuses.tournament_multiplier + bonus_points;

    return {
      base_score: Math.round(base_score * 100) / 100, // Round to 2 decimals
      bonuses,
      total_score: Math.round(total_score * 100) / 100,
      delta_from_actual: Math.round(delta * 100) / 100,
      accuracy_pct: Math.round(accuracy_pct * 100) / 100,
    };
  } catch (error) {
    console.error("Error calculating score v2:", error);

    // Return safe defaults on error (graceful degradation)
    const delta = Math.abs(predictedPrice - actualPrice);
    const errorRatio = delta / actualPrice;
    const base_score = Math.max(0, 1000 * (1 - errorRatio));
    const accuracy_pct = Math.max(0, (1 - errorRatio) * 100);

    return {
      base_score: Math.round(base_score * 100) / 100,
      bonuses: {
        early_bird: false,
        streak_bonus: false,
        bullseye: false,
        tournament_multiplier: tournamentId ? 1.5 : 1.0,
      },
      total_score: Math.round(base_score * (tournamentId ? 1.5 : 1.0) * 100) / 100,
      delta_from_actual: Math.round(delta * 100) / 100,
      accuracy_pct: Math.round(accuracy_pct * 100) / 100,
    };
  }
}

/**
 * Helper to calculate simple accuracy percentage without full scoring.
 * Useful for quick checks or display purposes.
 *
 * @param predictedPrice - User's predicted price
 * @param actualPrice - Actual final auction price
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(
  predictedPrice: number,
  actualPrice: number
): number {
  const delta = Math.abs(predictedPrice - actualPrice);
  const errorRatio = delta / actualPrice;
  const accuracy = Math.max(0, (1 - errorRatio) * 100);
  return Math.round(accuracy * 100) / 100;
}

/**
 * Helper to calculate delta (difference) from actual price.
 * Returns positive value for overestimate, negative for underestimate.
 *
 * @param predictedPrice - User's predicted price
 * @param actualPrice - Actual final auction price
 * @returns Delta from actual (positive = over, negative = under)
 */
export function calculateDelta(
  predictedPrice: number,
  actualPrice: number
): number {
  return Math.round((predictedPrice - actualPrice) * 100) / 100;
}
