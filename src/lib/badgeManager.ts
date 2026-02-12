import connectToDB from "@/lib/mongoose";
import Badge, { BadgeType } from "@/models/badge.model";
import { Predictions } from "@/models/predictions.model";
import { Types } from "mongoose";

interface BadgeCheckResult {
  awarded: boolean;
  badge_type?: BadgeType;
}

/**
 * Awards FIRST_PREDICTION badge if user has exactly 1 prediction.
 *
 * @param userId - The user's ObjectId as a string
 * @returns BadgeCheckResult indicating if badge was awarded
 */
export async function checkFirstPrediction(userId: string): Promise<BadgeCheckResult> {
  try {
    await connectToDB();

    const userObjectId = new Types.ObjectId(userId);

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      user_id: userObjectId,
      badge_type: BadgeType.FIRST_PREDICTION,
    });

    if (existingBadge) {
      return { awarded: false };
    }

    // Count user's predictions
    const predictionCount = await Predictions.countDocuments({
      "user.userId": userObjectId,
    });

    if (predictionCount === 1) {
      await Badge.create({
        user_id: userObjectId,
        badge_type: BadgeType.FIRST_PREDICTION,
        earned_at: new Date(),
        metadata: { first_prediction_at: new Date() },
      });

      console.log(`Awarded FIRST_PREDICTION badge to user ${userId}`);

      return { awarded: true, badge_type: BadgeType.FIRST_PREDICTION };
    }

    return { awarded: false };
  } catch (error) {
    console.error("Error checking first prediction badge:", error);
    return { awarded: false };
  }
}

/**
 * Awards FIRST_WIN badge if score ≥ 900 and user doesn't have this badge yet.
 *
 * @param userId - The user's ObjectId as a string
 * @param score - The prediction score
 * @returns BadgeCheckResult indicating if badge was awarded
 */
export async function checkFirstWin(userId: string, score: number): Promise<BadgeCheckResult> {
  try {
    await connectToDB();

    const userObjectId = new Types.ObjectId(userId);

    // Score must be >= 900 to qualify
    if (score < 900) {
      return { awarded: false };
    }

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      user_id: userObjectId,
      badge_type: BadgeType.FIRST_WIN,
    });

    if (existingBadge) {
      return { awarded: false };
    }

    // Award the badge
    await Badge.create({
      user_id: userObjectId,
      badge_type: BadgeType.FIRST_WIN,
      earned_at: new Date(),
      metadata: { winning_score: score },
    });

    console.log(`Awarded FIRST_WIN badge to user ${userId} with score ${score}`);

    return { awarded: true, badge_type: BadgeType.FIRST_WIN };
  } catch (error) {
    console.error("Error checking first win badge:", error);
    return { awarded: false };
  }
}

/**
 * Awards SHARPSHOOTER badge if user has 5+ predictions with score ≥ 900.
 *
 * @param userId - The user's ObjectId as a string
 * @returns BadgeCheckResult indicating if badge was awarded
 */
export async function checkSharpshooter(userId: string): Promise<BadgeCheckResult> {
  try {
    await connectToDB();

    const userObjectId = new Types.ObjectId(userId);

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      user_id: userObjectId,
      badge_type: BadgeType.SHARPSHOOTER,
    });

    if (existingBadge) {
      return { awarded: false };
    }

    // Count predictions with score >= 900
    const highScoreCount = await Predictions.countDocuments({
      "user.userId": userObjectId,
      score: { $gte: 900 },
    });

    if (highScoreCount >= 5) {
      await Badge.create({
        user_id: userObjectId,
        badge_type: BadgeType.SHARPSHOOTER,
        earned_at: new Date(),
        metadata: { high_score_count: highScoreCount },
      });

      console.log(`Awarded SHARPSHOOTER badge to user ${userId} with ${highScoreCount} high scores`);

      return { awarded: true, badge_type: BadgeType.SHARPSHOOTER };
    }

    return { awarded: false };
  } catch (error) {
    console.error("Error checking sharpshooter badge:", error);
    return { awarded: false };
  }
}

/**
 * Awards CENTURION badge if user has 100+ total predictions.
 *
 * @param userId - The user's ObjectId as a string
 * @returns BadgeCheckResult indicating if badge was awarded
 */
export async function checkCenturion(userId: string): Promise<BadgeCheckResult> {
  try {
    await connectToDB();

    const userObjectId = new Types.ObjectId(userId);

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      user_id: userObjectId,
      badge_type: BadgeType.CENTURION,
    });

    if (existingBadge) {
      return { awarded: false };
    }

    // Count total predictions
    const totalPredictions = await Predictions.countDocuments({
      "user.userId": userObjectId,
    });

    if (totalPredictions >= 100) {
      await Badge.create({
        user_id: userObjectId,
        badge_type: BadgeType.CENTURION,
        earned_at: new Date(),
        metadata: { total_predictions: totalPredictions },
      });

      console.log(`Awarded CENTURION badge to user ${userId} with ${totalPredictions} predictions`);

      return { awarded: true, badge_type: BadgeType.CENTURION };
    }

    return { awarded: false };
  } catch (error) {
    console.error("Error checking centurion badge:", error);
    return { awarded: false };
  }
}

/**
 * Awards TOURNAMENT_ROOKIE badge on first tournament entry.
 * Note: This should be called when a user enters a tournament, not based on prediction count.
 *
 * @param userId - The user's ObjectId as a string
 * @returns BadgeCheckResult indicating if badge was awarded
 */
export async function checkTournamentRookie(userId: string): Promise<BadgeCheckResult> {
  try {
    await connectToDB();

    const userObjectId = new Types.ObjectId(userId);

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      user_id: userObjectId,
      badge_type: BadgeType.TOURNAMENT_ROOKIE,
    });

    if (existingBadge) {
      return { awarded: false };
    }

    // Check if user has any tournament predictions
    const tournamentPredictionCount = await Predictions.countDocuments({
      "user.userId": userObjectId,
      tournament_id: { $exists: true, $ne: null },
    });

    if (tournamentPredictionCount >= 1) {
      await Badge.create({
        user_id: userObjectId,
        badge_type: BadgeType.TOURNAMENT_ROOKIE,
        earned_at: new Date(),
        metadata: { first_tournament_entry: new Date() },
      });

      console.log(`Awarded TOURNAMENT_ROOKIE badge to user ${userId}`);

      return { awarded: true, badge_type: BadgeType.TOURNAMENT_ROOKIE };
    }

    return { awarded: false };
  } catch (error) {
    console.error("Error checking tournament rookie badge:", error);
    return { awarded: false };
  }
}

/**
 * Helper function that runs all relevant badge checks for prediction-based achievements.
 * Call this after a user makes a prediction and it gets scored.
 *
 * @param userId - The user's ObjectId as a string
 * @param score - Optional score to check for score-based badges
 * @returns Array of awarded badges
 */
export async function checkAllPredictionBadges(
  userId: string,
  score?: number
): Promise<BadgeCheckResult[]> {
  try {
    const results: BadgeCheckResult[] = [];

    // Check first prediction
    const firstPredictionResult = await checkFirstPrediction(userId);
    if (firstPredictionResult.awarded) {
      results.push(firstPredictionResult);
    }

    // Check first win if score provided
    if (score !== undefined && score >= 900) {
      const firstWinResult = await checkFirstWin(userId, score);
      if (firstWinResult.awarded) {
        results.push(firstWinResult);
      }
    }

    // Check sharpshooter (5+ high scores)
    const sharpshooterResult = await checkSharpshooter(userId);
    if (sharpshooterResult.awarded) {
      results.push(sharpshooterResult);
    }

    // Check centurion (100+ predictions)
    const centurionResult = await checkCenturion(userId);
    if (centurionResult.awarded) {
      results.push(centurionResult);
    }

    // Check tournament rookie
    const tournamentRookieResult = await checkTournamentRookie(userId);
    if (tournamentRookieResult.awarded) {
      results.push(tournamentRookieResult);
    }

    return results;
  } catch (error) {
    console.error("Error checking all prediction badges:", error);
    return [];
  }
}
