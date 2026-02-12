"use client";

import { useEffect, useState } from "react";

/**
 * CountdownTimer Component
 *
 * Displays a live countdown timer with color-coded urgency levels.
 * Updates every second and shows different time formats based on remaining duration.
 *
 * @param endTime - The target end date/time
 * @param size - Display size variant: 'sm' | 'md' | 'lg'
 *
 * Color coding:
 * - Green (#00D4AA): > 24 hours remaining
 * - Amber (#FFB547): 1-24 hours remaining
 * - Red (#E94560): < 1 hour remaining
 * - Gray: Ended
 */

interface CountdownTimerProps {
  endTime: Date;
  size?: "sm" | "md" | "lg";
}

interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeRemaining = (endTime: Date): TimeRemaining => {
  const total = new Date(endTime).getTime() - Date.now();

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
};

const formatTimeDisplay = (time: TimeRemaining): string => {
  if (time.total <= 0) return "ENDED";

  if (time.days > 0) {
    return `${time.days}d ${time.hours}h ${time.minutes}m`;
  }

  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m`;
  }

  return `${time.minutes}m ${time.seconds}s`;
};

const getColorClass = (totalMs: number): string => {
  if (totalMs <= 0) return "text-[#64748B]"; // Gray for ended

  const hoursRemaining = totalMs / (1000 * 60 * 60);

  if (hoursRemaining < 1) return "text-[#E94560]"; // Red: < 1 hour
  if (hoursRemaining < 24) return "text-[#FFB547]"; // Amber: 1-24 hours
  return "text-[#00D4AA]"; // Green: > 24 hours
};

const getSizeClasses = (size: "sm" | "md" | "lg"): string => {
  switch (size) {
    case "sm":
      return "text-sm";
    case "lg":
      return "text-xl";
    case "md":
    default:
      return "text-base";
  }
};

export default function CountdownTimer({
  endTime,
  size = "md"
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(endTime)
  );

  useEffect(() => {
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining(endTime));

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const colorClass = getColorClass(timeRemaining.total);
  const sizeClass = getSizeClasses(size);

  return (
    <div
      className={`font-mono font-medium ${sizeClass} ${colorClass} tabular-nums`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatTimeDisplay(timeRemaining)}`}
    >
      {formatTimeDisplay(timeRemaining)}
    </div>
  );
}
