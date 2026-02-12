import connectToDB from "@/lib/mongoose";
import Streak from "@/models/streak.model";
import Badge, { BadgeType } from "@/models/badge.model";
import Users from "@/models/user.model";
import { Types } from "mongoose";

interface StreakUpdateResult {
  current_streak: number;
  longest_streak: number;
  milestone_reached?: BadgeType;
  freeze_used: boolean;
  streak_broken: boolean;
}

/**
 * Updates a user's streak based on prediction timing.
 * Handles streak increments, freeze tokens, and milestone badge awards.
 *
 * @param userId - The user's ObjectId as a string
 * @returns StreakUpdateResult with current streak state and status flags
 */
export async function updateStreak(userId: string): Promise<StreakUpdateResult> {
  try {
    await connectToDB();

    const userObjectId = new Types.ObjectId(userId);

    // Get or create streak document
    let streakDoc = await Streak.findOne({ user_id: userObjectId });

    if (!streakDoc) {
      // Create new streak document for first-time user
      streakDoc = await Streak.create({
        user_id: userObjectId,
        current_streak: 1,
        longest_streak: 1,
        last_prediction_date: new Date(),
        freeze_tokens: 0,
      });

      return {
        current_streak: 1,
        longest_streak: 1,
        freeze_used: false,
        streak_broken: false,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for day comparison

    const lastPredictionDate = streakDoc.last_prediction_date
      ? new Date(streakDoc.last_prediction_date)
      : null;

    if (lastPredictionDate) {
      lastPredictionDate.setHours(0, 0, 0, 0);
    }

    let result: StreakUpdateResult = {
      current_streak: streakDoc.current_streak,
      longest_streak: streakDoc.longest_streak,
      freeze_used: false,
      streak_broken: false,
    };

    // Case 1: Already predicted today - no change
    if (lastPredictionDate && lastPredictionDate.getTime() === today.getTime()) {
      return result;
    }

    // Calculate day gap
    const dayGap = lastPredictionDate
      ? Math.floor((today.getTime() - lastPredictionDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Case 2: Predicted yesterday - increment streak
    if (dayGap === 1) {
      streakDoc.current_streak += 1;

      // Update longest streak if needed
      if (streakDoc.current_streak > streakDoc.longest_streak) {
        streakDoc.longest_streak = streakDoc.current_streak;
      }

      result.current_streak = streakDoc.current_streak;
      result.longest_streak = streakDoc.longest_streak;

      // Check for milestone badges
      const milestone = await checkMilestoneBadge(userId, streakDoc.current_streak, userObjectId);
      if (milestone) {
        result.milestone_reached = milestone.badge_type;
        streakDoc.freeze_tokens += milestone.freeze_tokens;
      }
    }
    // Case 3: Gap = 1 day AND has freeze tokens - use freeze
    else if (dayGap === 2 && streakDoc.freeze_tokens > 0) {
      streakDoc.freeze_tokens -= 1;
      result.freeze_used = true;
      result.current_streak = streakDoc.current_streak;
      result.longest_streak = streakDoc.longest_streak;
    }
    // Case 4: Gap > 1 or no freeze tokens - reset streak
    else if (dayGap > 1) {
      streakDoc.current_streak = 1;
      result.current_streak = 1;
      result.longest_streak = streakDoc.longest_streak;
      result.streak_broken = true;
    }

    // Update last prediction date
    streakDoc.last_prediction_date = today;
    await streakDoc.save();

    // Sync streak data to User model for quick access
    await Users.findByIdAndUpdate(userObjectId, {
      current_streak: streakDoc.current_streak,
      longest_streak: streakDoc.longest_streak,
      last_prediction_at: today,
    });

    return result;
  } catch (error) {
    console.error("Error updating streak:", error);
    // Return safe defaults on error (graceful degradation)
    return {
      current_streak: 0,
      longest_streak: 0,
      freeze_used: false,
      streak_broken: false,
    };
  }
}

/**
 * Internal helper to check and award milestone badges.
 * Awards HOT_START (3d), ON_FIRE (7d), UNSTOPPABLE (14d), LEGEND (30d).
 */
async function checkMilestoneBadge(
  userId: string,
  currentStreak: number,
  userObjectId: Types.ObjectId
): Promise<{ badge_type: BadgeType; freeze_tokens: number } | null> {
  try {
    let badgeType: BadgeType | null = null;
    let freezeTokens = 0;

    // Determine which milestone was reached
    if (currentStreak === 3) {
      badgeType = BadgeType.HOT_START;
      freezeTokens = 1;
    } else if (currentStreak === 7) {
      badgeType = BadgeType.ON_FIRE;
      freezeTokens = 1;
    } else if (currentStreak === 14) {
      badgeType = BadgeType.UNSTOPPABLE;
      freezeTokens = 0;
    } else if (currentStreak === 30) {
      badgeType = BadgeType.LEGEND;
      freezeTokens = 3;
    }

    if (!badgeType) return null;

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      user_id: userObjectId,
      badge_type: badgeType,
    });

    if (existingBadge) return null;

    // Award the badge
    await Badge.create({
      user_id: userObjectId,
      badge_type: badgeType,
      earned_at: new Date(),
      metadata: { streak_value: currentStreak },
    });

    console.log(`Awarded ${badgeType} badge to user ${userId} at ${currentStreak}-day streak`);

    return { badge_type: badgeType, freeze_tokens: freezeTokens };
  } catch (error) {
    console.error("Error checking milestone badge:", error);
    return null;
  }
}
