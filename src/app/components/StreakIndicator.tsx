"use client";

/**
 * StreakIndicator Component
 *
 * Displays a user's prediction streak with fire emoji and color-coded styling.
 * Color levels based on streak duration:
 * - 0-2 days: Gray (#64748B)
 * - 3-6 days: Orange (#FFB547)
 * - 7-13 days: Red (#E94560)
 * - 14+ days: Purple gradient
 *
 * @param currentStreak - Number of consecutive days with predictions
 * @param size - Display size variant: 'sm' | 'md' | 'lg'
 */

interface StreakIndicatorProps {
  currentStreak: number;
  size?: "sm" | "md" | "lg";
}

const getStreakColor = (streak: number): string => {
  if (streak >= 14) {
    // Purple gradient for legends
    return "bg-gradient-to-r from-purple-600 to-pink-600";
  }
  if (streak >= 7) {
    return "bg-[#E94560]"; // Red
  }
  if (streak >= 3) {
    return "bg-[#FFB547]"; // Orange
  }
  return "bg-[#64748B]"; // Gray
};

const getStreakTextColor = (streak: number): string => {
  if (streak >= 14) {
    return "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400";
  }
  if (streak >= 7) {
    return "text-[#E94560]"; // Red
  }
  if (streak >= 3) {
    return "text-[#FFB547]"; // Orange
  }
  return "text-[#64748B]"; // Gray
};

const getSizeClasses = (
  size: "sm" | "md" | "lg"
): { container: string; emoji: string; number: string } => {
  switch (size) {
    case "sm":
      return {
        container: "gap-1 px-2 py-1",
        emoji: "text-sm",
        number: "text-xs",
      };
    case "lg":
      return {
        container: "gap-2 px-4 py-2",
        emoji: "text-2xl",
        number: "text-xl",
      };
    case "md":
    default:
      return {
        container: "gap-1.5 px-3 py-1.5",
        emoji: "text-lg",
        number: "text-base",
      };
  }
};

const getStreakLabel = (streak: number): string => {
  if (streak === 0) {
    return "No streak yet";
  }
  if (streak === 1) {
    return "1 day prediction streak!";
  }
  return `${streak} day prediction streak!`;
};

export default function StreakIndicator({
  currentStreak,
  size = "md",
}: StreakIndicatorProps) {
  const colorClass = getStreakColor(currentStreak);
  const textColorClass = getStreakTextColor(currentStreak);
  const sizeClasses = getSizeClasses(size);
  const label = getStreakLabel(currentStreak);

  // Don't show indicator if no streak
  if (currentStreak === 0) {
    return null;
  }

  return (
    <div
      className="group relative inline-flex items-center"
      role="status"
      aria-label={label}
    >
      {/* Badge */}
      <div
        className={`
          ${colorClass}
          ${sizeClasses.container}
          flex items-center rounded-full
          transition-all duration-200
          hover:shadow-lg
        `}
      >
        {/* Fire Emoji */}
        <span className={`${sizeClasses.emoji}`} aria-hidden="true">
          🔥
        </span>

        {/* Streak Number */}
        <span
          className={`
            ${sizeClasses.number}
            font-mono font-bold text-white
          `}
        >
          {currentStreak}
        </span>
      </div>

      {/* Tooltip */}
      <div
        className="
          pointer-events-none absolute bottom-full left-1/2 mb-2
          -translate-x-1/2 whitespace-nowrap rounded-lg
          bg-[#1A1A3E] px-3 py-2 text-sm text-white
          opacity-0 shadow-lg transition-opacity
          group-hover:opacity-100
        "
        role="tooltip"
      >
        {label}
        <div
          className="
            absolute left-1/2 top-full h-0 w-0
            -translate-x-1/2 border-4 border-transparent
            border-t-[#1A1A3E]
          "
        />
      </div>
    </div>
  );
}
