"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SpokeSegmentedControl from "@/app/components/profile/SpokeSegmentedControl";

export type TournamentFilter = "all" | "top10" | "wins";

interface Props {
  filter: TournamentFilter;
  q: string;
}

const FILTER_OPTIONS: ReadonlyArray<{ value: TournamentFilter; label: string }> =
  [
    { value: "all", label: "All" },
    { value: "top10", label: "Top 10" },
    { value: "wins", label: "Wins (#1)" },
  ];

export default function TournamentFinishesFilterBar({ filter, q }: Props) {
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
      router.push(qs ? `/profile/tournaments?${qs}` : "/profile/tournaments");
    },
    [router, searchParams]
  );

  const handleFilter = (value: TournamentFilter) => {
    pushParams({ filter: value === "all" ? null : value });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    pushParams({ q: trimmed.length === 0 ? null : trimmed });
  };

  return (
    <div
      data-testid="tournament-finishes-filter-bar"
      className="mt-6 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#13202D] p-2 md:flex-row md:items-center md:gap-2"
    >
      <SpokeSegmentedControl
        label="Filter tournament finishes"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={handleFilter}
      />
      <form
        onSubmit={handleSearchSubmit}
        role="search"
        className="flex flex-1 items-center gap-2 md:ml-auto md:max-w-xs"
      >
        <label htmlFor="tournament-search" className="sr-only">
          Search tournaments by name
        </label>
        <input
          id="tournament-search"
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search tournaments…"
          className="w-full rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-[#E94560]/60 focus:outline-none focus:ring-1 focus:ring-[#E94560]/40"
        />
      </form>
    </div>
  );
}

