"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trophy, Users, DollarSign, Calendar, Crown } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/card_component";

interface ArchivedWinner {
  userID?: string;
  username?: string;
  userImage?: string;
  prize?: number;
  rank?: number;
}

interface ArchivedTournament {
  _id: string;
  name: string;
  description?: string;
  banner?: string;
  featured_image?: string;
  type: string;
  buyInFee: number;
  prizePool: number;
  calculatedPrizePool?: number;
  startTime: string;
  endTime: string;
  auction_ids: string[];
  users?: { userId: string }[];
  haveWinners?: boolean;
  winners?: ArchivedWinner[];
}

const PAGE_SIZE = 12;

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  const sOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const eOpts: Intl.DateTimeFormatOptions = sameMonth
    ? { day: "numeric", year: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };
  return `${s.toLocaleDateString("en-US", sOpts)} — ${e.toLocaleDateString("en-US", eOpts)}`;
}

function formatMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

export default function TournamentArchivePage() {
  const [tournaments, setTournaments] = useState<ArchivedTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const res = await fetch(
          `/api/tournaments?type=archive&offset=${offset}&limit=${PAGE_SIZE}&sort=newest`
        );
        const data = await res.json();
        if (cancelled) return;
        setTournaments(data.tournaments || []);
        setTotalPages(Math.max(1, data.total || 1));
      } catch (err) {
        console.error("Failed to load archive:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Stats calc from current page — for a cross-page total we'd need a
  // dedicated /stats route; this is an honest approximation.
  const stats = tournaments.reduce(
    (acc, t) => {
      const pool =
        (t.calculatedPrizePool || 0) ||
        (t.buyInFee || 0) * (t.users?.length || 0);
      const champ = (t.winners || []).find((w) => w.rank === 1);
      acc.prizesDistributed += pool;
      acc.players += t.users?.length || 0;
      if (champ) acc.crowned += 1;
      return acc;
    },
    { prizesDistributed: 0, players: 0, crowned: 0 }
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/tournaments"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to active tournaments
      </Link>

      {/* Header */}
      <div className="mb-8 border-b border-white/[0.08] pb-8">
        <div className="mb-2 flex items-center gap-3">
          <Crown className="h-7 w-7 text-[#FFB547]" />
          <h1 className="text-4xl font-bold">Tournament Archive</h1>
        </div>
        <p className="text-lg text-gray-400">
          Every tournament that has closed. Winners, prizes, and results —
          permanent record.
        </p>
      </div>

      {/* Stats (current page) */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-white/[0.08] bg-[#16181f] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#FFB547]/15 p-2.5">
              <Trophy className="h-5 w-5 text-[#FFB547]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                Champions (this page)
              </div>
              <div className="font-['JetBrains_Mono'] text-xl font-bold text-white">
                {stats.crowned}
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-white/[0.08] bg-[#16181f] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#00D4AA]/15 p-2.5">
              <DollarSign className="h-5 w-5 text-[#00D4AA]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                Prizes on this page
              </div>
              <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#00D4AA]">
                {formatMoney(stats.prizesDistributed)}
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-white/[0.08] bg-[#16181f] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#E94560]/15 p-2.5">
              <Users className="h-5 w-5 text-[#E94560]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                Players (this page)
              </div>
              <div className="font-['JetBrains_Mono'] text-xl font-bold text-white">
                {stats.players}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="animate-pulse overflow-hidden border-white/[0.08] bg-[#16181f]"
            >
              <div className="aspect-[16/9] bg-[#1E2A36]" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 rounded bg-[#1E2A36]" />
                <div className="h-4 w-1/2 rounded bg-[#1E2A36]" />
                <div className="h-12 rounded bg-[#1E2A36]" />
              </div>
            </Card>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-[#16181f] p-12 text-center">
          <Crown className="mb-4 h-16 w-16 text-gray-600" />
          <h3 className="mb-2 text-xl font-bold">No archived tournaments yet</h3>
          <p className="mb-6 max-w-md text-gray-400">
            When tournaments close, they land here with full results and winner
            showcases. Check back after the first round wraps.
          </p>
          <Link href="/tournaments">
            <Button asChild className="bg-[#E94560] hover:bg-[#E94560]/90">
              See active tournaments
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => {
            const champ = (t.winners || []).find((w) => w.rank === 1);
            const runners = (t.winners || []).filter((w) => (w.rank || 0) > 1).slice(0, 2);
            const pool =
              (t.calculatedPrizePool || 0) ||
              (t.buyInFee || 0) * (t.users?.length || 0);
            const banner = t.banner || t.featured_image;
            return (
              <Link
                key={t._id}
                href={`/tournaments/${t._id}`}
                className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#16181f] transition-colors hover:border-[#FFB547]/40"
              >
                {/* Banner with ENDED badge */}
                <div className="relative aspect-[16/9] overflow-hidden bg-[#1E2A36]">
                  {banner && (
                    <Image
                      src={banner}
                      alt={t.name}
                      fill
                      className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/40 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-300 backdrop-blur-sm">
                      Ended
                    </span>
                  </div>
                  {champ && (
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFB547]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FFB547] backdrop-blur-sm">
                        <Crown className="h-3 w-3" />
                        Crowned
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="line-clamp-1 text-lg font-bold text-white">
                      {t.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange(t.startTime, t.endTime)}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  {/* Winner row */}
                  {champ ? (
                    <div className="mb-4 rounded-lg border border-[#FFB547]/20 bg-[#FFB547]/5 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FFB547]">
                          1st Place
                        </span>
                        {champ.prize != null && champ.prize > 0 && (
                          <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#00D4AA]">
                            {formatMoney(champ.prize)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {champ.userImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={champ.userImage}
                            alt={champ.username || "Champion"}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A36] text-xs font-bold text-white">
                            {(champ.username || "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate text-sm font-semibold text-white">
                          @{champ.username || "player"}
                        </span>
                      </div>
                      {runners.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-gray-400">
                          {runners.map((r) => (
                            <span key={r.userID || r.username}>
                              #{r.rank} @{r.username || "player"}
                              {r.prize != null && r.prize > 0 && (
                                <span className="ml-1 font-['JetBrains_Mono'] text-gray-500">
                                  ({formatMoney(r.prize)})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 rounded-lg border border-white/[0.04] bg-[#1E2A36]/40 p-3 text-center">
                      <span className="text-xs text-gray-500">
                        No champion recorded
                      </span>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-center">
                    <div>
                      <div className="font-['JetBrains_Mono'] text-sm font-bold text-white">
                        {t.auction_ids?.length || 0}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">
                        Cars
                      </div>
                    </div>
                    <div>
                      <div className="font-['JetBrains_Mono'] text-sm font-bold text-white">
                        {t.users?.length || 0}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">
                        Players
                      </div>
                    </div>
                    <div>
                      <div className="font-['JetBrains_Mono'] text-sm font-bold text-[#00D4AA]">
                        {pool > 0 ? formatMoney(pool) : "FREE"}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">
                        Pool
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className=""
          >
            Previous
          </Button>
          <span className="px-4 font-['JetBrains_Mono'] text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className=""
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
