"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CHALLENGES = [
  { id: "pick_3", label: "Make 3 picks today", target: 3 },
  { id: "within_5pct", label: "Hit within 5% on any car", target: 1 },
  { id: "new_make", label: "Pick a make you've never picked", target: 1 },
  { id: "pick_2", label: "Make 2 picks today", target: 2 },
  { id: "tournament", label: "Enter a tournament today", target: 1 },
  { id: "pick_5", label: "Make 5 picks today", target: 5 },
  { id: "pick_1", label: "Make your first pick today", target: 1 },
] as const;

function getTodayChallenge() {
  const dayOfWeek = new Date().getDay();
  return CHALLENGES[dayOfWeek % CHALLENGES.length];
}

export function DailyChallenge() {
  const { data: session } = useSession();
  const [todayPickCount, setTodayPickCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const challenge = getTodayChallenge();

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    fetch(`/api/myPredictions`)
      .then((r) => r.json())
      .then((data) => {
        // API returns { predictions: [...] }
        const predictions = Array.isArray(data)
          ? data
          : Array.isArray(data?.predictions)
            ? data.predictions
            : [];
        const todayPicks = predictions.filter((p: any) => {
          if (!p.createdAt) return false;
          return new Date(p.createdAt) >= new Date(todayISO);
        });
        setTodayPickCount(todayPicks.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const progress = Math.min(todayPickCount, challenge.target);
  const completed = progress >= challenge.target;
  const pct = Math.round((progress / challenge.target) * 100);

  if (loading) return null;

  return (
    <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#FFB547]">Daily Challenge</span>
        {completed && (
          <span className="text-xs bg-[#00D4AA]/20 text-[#00D4AA] px-2 py-1 rounded-full font-medium">
            Complete!
          </span>
        )}
      </div>
      <p className="text-white font-medium mb-3">{challenge.label}</p>
      <div className="w-full bg-[#0A0A1A] rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            completed ? "bg-[#00D4AA]" : "bg-[#E94560]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-gray-400 font-mono">
        {progress} / {challenge.target}
      </p>
    </div>
  );
}
