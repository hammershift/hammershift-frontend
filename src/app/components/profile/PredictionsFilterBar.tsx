"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SpokeSegmentedControl from "@/app/components/profile/SpokeSegmentedControl";

export type StatusFilter = "all" | "active" | "completed";
export type ModeFilter = "all" | "free-play" | "tournament";

interface Props {
  status: StatusFilter;
  mode: ModeFilter;
  q: string;
}

const STATUS_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const MODE_OPTIONS: ReadonlyArray<{ value: ModeFilter; label: string }> = [
  { value: "all", label: "All modes" },
  { value: "free-play", label: "Free-play" },
  { value: "tournament", label: "Tournament" },
];

export default function PredictionsFilterBar({ status, mode, q }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(q);

  // Keep input in sync if the URL changes via browser nav.
  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      // Reset pagination on any filter change.
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `/profile/predictions?${qs}` : "/profile/predictions");
    },
    [router, searchParams]
  );

  const handleStatus = (value: StatusFilter) => {
    pushParams({ status: value === "all" ? null : value });
  };

  const handleMode = (value: ModeFilter) => {
    pushParams({ mode: value === "all" ? null : value });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    pushParams({ q: trimmed.length === 0 ? null : trimmed });
  };

  return (
    <div
      data-testid="predictions-filter-bar"
      className="mt-6 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#13202D] p-2 md:flex-row md:items-center md:gap-2"
    >
      <SpokeSegmentedControl
        label="Filter by status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={handleStatus}
      />
      <SpokeSegmentedControl
        label="Filter by mode"
        options={MODE_OPTIONS}
        value={mode}
        onChange={handleMode}
      />
      <form
        onSubmit={handleSearchSubmit}
        role="search"
        className="flex flex-1 items-center gap-2 md:ml-auto md:max-w-xs"
      >
        <label htmlFor="prediction-search" className="sr-only">
          Search by market title
        </label>
        <input
          id="prediction-search"
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search markets…"
          className="w-full rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-[#E94560]/60 focus:outline-none focus:ring-1 focus:ring-[#E94560]/40"
        />
      </form>
    </div>
  );
}

