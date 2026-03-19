"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: "number" | "abbreviated" | "currency";
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatValue(
  value: number,
  format: "number" | "abbreviated" | "currency"
): string {
  if (format === "abbreviated" || format === "currency") {
    const prefix = format === "currency" ? "$" : "";
    if (value >= 1_000_000) {
      return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${prefix}${(value / 1_000).toFixed(1)}K`;
    }
    return `${prefix}${Math.round(value).toLocaleString("en-US")}`;
  }
  // "number"
  return Math.round(value).toLocaleString("en-US");
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  format = "number",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end <= 0) {
      setDisplayValue("—");
      return;
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = easedProgress * end;

      setDisplayValue(formatValue(currentValue, format));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, format]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
