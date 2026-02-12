"use client";

import Image from "next/image";
import StreakIndicator from "./StreakIndicator";
import { User } from "@/models/user.model";

/**
 * LeaderboardRow Component
 *
 * Displays a single leaderboard entry with rank, user info, stats, and streak.
 * Highlights the current user's row and shows medals for top 3 positions.
 *
 * @param user - User data object
 * @param rank - User's current rank position
 * @param score - Total score points
 * @param accuracy - Accuracy percentage (0-100)
 * @param predictions - Total number of predictions
 * @param isCurrentUser - Whether this row represents the logged-in user
 * @param compact - Optional compact layout for mobile
 */

interface LeaderboardRowProps {
  user: Partial<User> & {
    _id: string;
    username: string;
    fullName?: string;
  };
  rank: number;
  score: number;
  accuracy: number;
  predictions: number;
  isCurrentUser?: boolean;
  compact?: boolean;
}

const getRankDisplay = (rank: number): { icon: string | null; text: string } => {
  switch (rank) {
    case 1:
      return { icon: "🥇", text: "1" };
    case 2:
      return { icon: "🥈", text: "2" };
    case 3:
      return { icon: "🥉", text: "3" };
    default:
      return { icon: null, text: rank.toString() };
  }
};

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 80) return "text-[#00D4AA]"; // Green
  if (accuracy >= 60) return "text-[#FFB547]"; // Amber
  return "text-[#E94560]"; // Red
};

export default function LeaderboardRow({
  user,
  rank,
  score,
  accuracy,
  predictions,
  isCurrentUser = false,
  compact = false,
}: LeaderboardRowProps) {
  const rankDisplay = getRankDisplay(rank);
  const accuracyColor = getAccuracyColor(accuracy);
  const streak = user.current_streak || 0;

  // Desktop layout
  if (!compact) {
    return (
      <tr
        className={`
          group border-b border-[#1E293B] transition-colors
          ${isCurrentUser ? "bg-[#1A1A3E]" : "hover:bg-[#12122A]"}
        `}
        role="row"
      >
        {/* Rank */}
        <td className="px-4 py-4 text-left" role="cell">
          <div className="flex items-center gap-2">
            {rankDisplay.icon && (
              <span className="text-2xl" aria-hidden="true">
                {rankDisplay.icon}
              </span>
            )}
            <span
              className={`
                font-mono text-lg font-bold
                ${rank <= 3 ? "text-[#FFB547]" : "text-[#94A3B8]"}
              `}
            >
              #{rankDisplay.text}
            </span>
          </div>
        </td>

        {/* User Info */}
        <td className="px-4 py-4" role="cell">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#1A1A3E]">
              <Image
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={`${user.username}'s avatar`}
                fill
                className="object-cover"
              />
            </div>

            {/* Username */}
            <div>
              <p className="font-semibold text-white">{user.username}</p>
              {user.fullName && (
                <p className="text-sm text-[#64748B]">{user.fullName}</p>
              )}
            </div>

            {/* Current User Badge */}
            {isCurrentUser && (
              <span className="ml-2 rounded bg-[#E94560] px-2 py-0.5 text-xs font-bold text-white">
                YOU
              </span>
            )}
          </div>
        </td>

        {/* Score */}
        <td className="px-4 py-4 text-center" role="cell">
          <span className="font-mono text-lg font-bold text-white">
            {score.toLocaleString()}
          </span>
        </td>

        {/* Predictions */}
        <td className="px-4 py-4 text-center" role="cell">
          <span className="font-mono text-base text-[#94A3B8]">
            {predictions}
          </span>
        </td>

        {/* Accuracy with Progress Bar */}
        <td className="px-4 py-4" role="cell">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              {/* Progress Bar Background */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1A3E]">
                {/* Progress Bar Fill */}
                <div
                  className={`h-full transition-all duration-300 ${
                    accuracy >= 80
                      ? "bg-[#00D4AA]"
                      : accuracy >= 60
                        ? "bg-[#FFB547]"
                        : "bg-[#E94560]"
                  }`}
                  style={{ width: `${accuracy}%` }}
                  role="progressbar"
                  aria-valuenow={accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
            {/* Percentage */}
            <span className={`font-mono text-sm font-medium ${accuracyColor}`}>
              {accuracy.toFixed(1)}%
            </span>
          </div>
        </td>

        {/* Streak */}
        <td className="px-4 py-4 text-right" role="cell">
          {streak >= 3 && <StreakIndicator currentStreak={streak} size="sm" />}
        </td>
      </tr>
    );
  }

  // Mobile compact layout
  return (
    <div
      className={`
        rounded-lg border border-[#1E293B] p-4 transition-all
        ${isCurrentUser ? "border-[#E94560] bg-[#1A1A3E]" : "bg-[#12122A]"}
      `}
      role="article"
    >
      {/* Rank and User Info */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Rank with Medal */}
          <div className="flex flex-col items-center">
            {rankDisplay.icon && (
              <span className="text-xl" aria-hidden="true">
                {rankDisplay.icon}
              </span>
            )}
            <span className="font-mono text-sm font-bold text-[#94A3B8]">
              #{rankDisplay.text}
            </span>
          </div>

          {/* Avatar and Username */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#1A1A3E]">
              <Image
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={`${user.username}'s avatar`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.username}</p>
            </div>
          </div>
        </div>

        {/* Current User Badge */}
        {isCurrentUser && (
          <span className="rounded bg-[#E94560] px-2 py-0.5 text-xs font-bold text-white">
            YOU
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Score */}
        <div>
          <p className="mb-1 text-xs text-[#64748B]">Score</p>
          <p className="font-mono text-base font-bold text-white">
            {score.toLocaleString()}
          </p>
        </div>

        {/* Predictions */}
        <div>
          <p className="mb-1 text-xs text-[#64748B]">Predictions</p>
          <p className="font-mono text-base text-[#94A3B8]">{predictions}</p>
        </div>

        {/* Accuracy */}
        <div>
          <p className="mb-1 text-xs text-[#64748B]">Accuracy</p>
          <div>
            <p className={`font-mono text-base font-medium ${accuracyColor}`}>
              {accuracy.toFixed(1)}%
            </p>
            {/* Progress Bar */}
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A3E]">
              <div
                className={`h-full ${
                  accuracy >= 80
                    ? "bg-[#00D4AA]"
                    : accuracy >= 60
                      ? "bg-[#FFB547]"
                      : "bg-[#E94560]"
                }`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Streak */}
      {streak >= 3 && (
        <div className="mt-3 flex justify-end">
          <StreakIndicator currentStreak={streak} size="sm" />
        </div>
      )}
    </div>
  );
}
