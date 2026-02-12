"use client";

import { BadgeType } from "@/models/badge.model";
import { Lock } from "lucide-react";

/**
 * BadgeDisplay Component
 *
 * Displays achievement badges with icons, names, and locked/unlocked states.
 * Shows tooltips with descriptions on hover.
 *
 * @param badge - Badge type enum value
 * @param size - Display size variant: 'sm' | 'md' | 'lg'
 * @param locked - Whether the badge is locked (not earned)
 * @param earnedDate - Date when badge was earned (optional)
 * @param showTooltip - Whether to show tooltip on hover (default: true)
 */

interface Badge {
  badge_type: BadgeType;
  earned_at?: Date;
}

interface BadgeDisplayProps {
  badge: Badge | BadgeType; // Accept either full badge object or just the type
  size?: "sm" | "md" | "lg";
  locked?: boolean;
  earnedDate?: Date;
  showTooltip?: boolean;
}

interface BadgeConfig {
  icon: string;
  name: string;
  description: string;
  color: string;
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  [BadgeType.FIRST_PREDICTION]: {
    icon: "🎯",
    name: "First Prediction",
    description: "Made your first price prediction",
    color: "from-blue-500 to-cyan-500",
  },
  [BadgeType.FIRST_WIN]: {
    icon: "🏆",
    name: "First Win",
    description: "Won your first auction prediction",
    color: "from-yellow-500 to-amber-500",
  },
  [BadgeType.HOT_START]: {
    icon: "🔥",
    name: "Hot Start",
    description: "Achieved a 3-day prediction streak",
    color: "from-orange-500 to-red-500",
  },
  [BadgeType.ON_FIRE]: {
    icon: "🔥🔥",
    name: "On Fire",
    description: "Achieved a 7-day prediction streak",
    color: "from-red-500 to-pink-500",
  },
  [BadgeType.UNSTOPPABLE]: {
    icon: "⚡",
    name: "Unstoppable",
    description: "Achieved a 14-day prediction streak",
    color: "from-purple-500 to-pink-500",
  },
  [BadgeType.LEGEND]: {
    icon: "👑",
    name: "Legend",
    description: "Achieved a 30-day prediction streak",
    color: "from-yellow-400 to-yellow-600",
  },
  [BadgeType.TOURNAMENT_ROOKIE]: {
    icon: "🎮",
    name: "Tournament Rookie",
    description: "Entered your first tournament",
    color: "from-green-500 to-emerald-500",
  },
  [BadgeType.TOURNAMENT_CHAMPION]: {
    icon: "🥇",
    name: "Tournament Champion",
    description: "Won a tournament",
    color: "from-yellow-400 to-yellow-600",
  },
  [BadgeType.SHARPSHOOTER]: {
    icon: "🎯",
    name: "Sharpshooter",
    description: "Achieved 5 scores of 900 or higher",
    color: "from-indigo-500 to-purple-500",
  },
  [BadgeType.CENTURION]: {
    icon: "💯",
    name: "Centurion",
    description: "Made 100 total predictions",
    color: "from-cyan-500 to-blue-500",
  },
  [BadgeType.TOP_10]: {
    icon: "🏅",
    name: "Top 10",
    description: "Reached top 10 on the leaderboard",
    color: "from-amber-500 to-orange-500",
  },
};

const getSizeClasses = (
  size: "sm" | "md" | "lg"
): { container: string; icon: string; text: string; date: string } => {
  switch (size) {
    case "sm":
      return {
        container: "w-16 h-16 p-2",
        icon: "text-2xl",
        text: "text-[10px]",
        date: "text-[8px]",
      };
    case "lg":
      return {
        container: "w-32 h-32 p-4",
        icon: "text-5xl",
        text: "text-sm",
        date: "text-xs",
      };
    case "md":
    default:
      return {
        container: "w-24 h-24 p-3",
        icon: "text-4xl",
        text: "text-xs",
        date: "text-[10px]",
      };
  }
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export default function BadgeDisplay({
  badge,
  size = "md",
  locked = false,
  earnedDate,
  showTooltip = true,
}: BadgeDisplayProps) {
  // Handle both Badge object and BadgeType enum
  const badgeType = typeof badge === "string" ? badge : badge.badge_type;
  const earned = typeof badge === "object" ? badge.earned_at : earnedDate;

  const config = BADGE_CONFIGS[badgeType];
  const sizeClasses = getSizeClasses(size);

  if (!config) {
    console.warn(`Unknown badge type: ${badgeType}`);
    return null;
  }

  return (
    <div className="group relative inline-flex" role="img" aria-label={config.name}>
      {/* Badge Container */}
      <div
        className={`
          ${sizeClasses.container}
          relative flex flex-col items-center justify-center
          rounded-lg border-2
          ${locked ? "border-[#1E293B] bg-[#12122A]" : `border-transparent bg-gradient-to-br ${config.color}`}
          transition-all duration-300
          ${locked ? "grayscale" : "hover:scale-105 hover:shadow-lg"}
        `}
      >
        {/* Lock Overlay */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
            <Lock className="h-6 w-6 text-[#64748B]" />
          </div>
        )}

        {/* Badge Icon */}
        <div
          className={`${sizeClasses.icon} ${locked ? "opacity-30" : ""}`}
          aria-hidden="true"
        >
          {config.icon}
        </div>

        {/* Badge Name */}
        <p
          className={`
            ${sizeClasses.text}
            mt-1 text-center font-semibold leading-tight
            ${locked ? "text-[#64748B]" : "text-white"}
          `}
        >
          {config.name}
        </p>

        {/* Earned Date */}
        {earned && !locked && (
          <p className={`${sizeClasses.date} mt-0.5 text-[#94A3B8]`}>
            {formatDate(earned)}
          </p>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            pointer-events-none absolute bottom-full left-1/2 mb-2
            z-10 -translate-x-1/2 whitespace-nowrap
            rounded-lg bg-[#1A1A3E] px-3 py-2
            text-sm text-white opacity-0 shadow-xl
            transition-opacity group-hover:opacity-100
          "
          role="tooltip"
        >
          <div className="font-semibold">{config.name}</div>
          <div className="mt-1 text-xs text-[#94A3B8]">{config.description}</div>
          {earned && !locked && (
            <div className="mt-1 text-xs text-[#00D4AA]">
              Earned: {formatDate(earned)}
            </div>
          )}
          {locked && (
            <div className="mt-1 text-xs text-[#64748B]">Locked</div>
          )}
          {/* Tooltip Arrow */}
          <div
            className="
              absolute left-1/2 top-full h-0 w-0
              -translate-x-1/2 border-4 border-transparent
              border-t-[#1A1A3E]
            "
          />
        </div>
      )}
    </div>
  );
}
