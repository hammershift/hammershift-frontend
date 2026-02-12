"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * StatCard Component
 *
 * Displays a single statistic with optional icon, trend indicator, and color variants.
 * Used for dashboard metrics, profile stats, and summary displays.
 *
 * @param label - Descriptive label for the stat
 * @param value - The stat value (number or string)
 * @param icon - Optional icon component
 * @param trend - Optional trend direction: 'up' | 'down'
 * @param trendValue - Optional trend percentage or value to display
 * @param color - Color variant: 'default' | 'success' | 'warning' | 'danger'
 * @param size - Size variant: 'sm' | 'md' | 'lg'
 * @param subtitle - Optional subtitle text below the value
 */

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down";
  trendValue?: string | number;
  color?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  subtitle?: string;
}

const getColorClasses = (color: "default" | "success" | "warning" | "danger") => {
  switch (color) {
    case "success":
      return {
        bg: "bg-[#00D4AA]/10",
        border: "border-[#00D4AA]/20",
        icon: "text-[#00D4AA]",
        value: "text-[#00D4AA]",
      };
    case "warning":
      return {
        bg: "bg-[#FFB547]/10",
        border: "border-[#FFB547]/20",
        icon: "text-[#FFB547]",
        value: "text-[#FFB547]",
      };
    case "danger":
      return {
        bg: "bg-[#E94560]/10",
        border: "border-[#E94560]/20",
        icon: "text-[#E94560]",
        value: "text-[#E94560]",
      };
    case "default":
    default:
      return {
        bg: "bg-[#12122A]",
        border: "border-[#1E293B]",
        icon: "text-[#94A3B8]",
        value: "text-white",
      };
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return {
        container: "p-3",
        icon: "h-4 w-4",
        value: "text-lg",
        label: "text-xs",
        subtitle: "text-xs",
        trend: "text-xs",
      };
    case "lg":
      return {
        container: "p-6",
        icon: "h-8 w-8",
        value: "text-4xl",
        label: "text-base",
        subtitle: "text-sm",
        trend: "text-sm",
      };
    case "md":
    default:
      return {
        container: "p-4",
        icon: "h-6 w-6",
        value: "text-2xl",
        label: "text-sm",
        subtitle: "text-xs",
        trend: "text-xs",
      };
  }
};

const getTrendColor = (trend: "up" | "down") => {
  return trend === "up" ? "text-[#00D4AA]" : "text-[#E94560]";
};

const formatValue = (value: string | number): string => {
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value;
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  color = "default",
  size = "md",
  subtitle,
}: StatCardProps) {
  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);
  const trendColor = trend ? getTrendColor(trend) : "";

  return (
    <article
      className={`
        ${colorClasses.bg} ${colorClasses.border}
        ${sizeClasses.container}
        flex flex-col rounded-lg border
        transition-all duration-200
        hover:border-[#E94560]/50 hover:shadow-lg
      `}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      {/* Header: Label and Icon */}
      <div className="mb-2 flex items-center justify-between">
        <p className={`${sizeClasses.label} font-medium text-[#94A3B8]`}>
          {label}
        </p>
        {icon && (
          <div className={`${sizeClasses.icon} ${colorClasses.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1 flex items-baseline gap-2">
        <p
          className={`
            ${sizeClasses.value} ${colorClasses.value}
            font-mono font-bold leading-none
          `}
        >
          {formatValue(value)}
        </p>

        {/* Trend Indicator */}
        {trend && (
          <div className={`flex items-center gap-0.5 ${trendColor}`}>
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {trendValue && (
              <span className={`${sizeClasses.trend} font-mono font-semibold`}>
                {formatValue(trendValue)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className={`${sizeClasses.subtitle} text-[#64748B]`}>
          {subtitle}
        </p>
      )}
    </article>
  );
}
