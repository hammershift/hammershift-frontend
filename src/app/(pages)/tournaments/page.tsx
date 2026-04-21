"use client";
import React, { useState, useEffect } from "react";
import {
  Trophy,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/app/components/card_component";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { formatDistanceToNow, isValid } from "date-fns";
import { Tournament } from "@/models/tournament.model";
import TournamentGrid from "@/app/components/tournament_grid";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { LadderProgress, LadderData } from "@/app/components/LadderProgress";

type StatusFilter = 'all' | 'active' | 'upcoming' | 'completed';
type TypeFilter = 'all' | 'free_play' | 'paid';
type SortOption = 'ending_soon' | 'prize_pool' | 'newest';

// Next tournament batch lands when the create-tournaments GitHub Action runs.
// Schedule: Mon/Tue/Thu/Fri at 12:00 UTC (see .github/workflows/create-tournaments.yml).
// Keep this in sync with that cron expression.
const CRON_DAYS_UTC = [1, 2, 4, 5]; // 0=Sun ... 6=Sat
const CRON_HOUR_UTC = 12;
function getNextTournamentBatch(now: Date = new Date()): Date {
  for (let i = 0; i < 8; i++) {
    const candidate = new Date(now);
    candidate.setUTCDate(candidate.getUTCDate() + i);
    candidate.setUTCHours(CRON_HOUR_UTC, 0, 0, 0);
    if (candidate <= now) continue;
    if (CRON_DAYS_UTC.includes(candidate.getUTCDay())) return candidate;
  }
  return now;
}

export default function TournamentsPage() {
  const track = useTrackEvent();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('ending_soon');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ladder
  const [ladderData, setLadderData] = useState<LadderData | null>(null);
  const [ladderLoading, setLadderLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    activeTournaments: 0,
    totalPrizePool: 0,
    totalPlayers: 0
  });

  const itemsPerPage = 12;

  useEffect(() => {
    // Track page view
    track('tournament_hub_viewed', {
      page: currentPage,
      status_filter: statusFilter,
      type_filter: typeFilter,
      sort_by: sortBy
    });
  }, []);

  useEffect(() => {
    async function loadTournaments() {
      try {
        setLoading(true);

        // Fetch active (free + paid) and recently ended tournaments
        const [freeData, paidData, recentData] = await Promise.all([
          fetch(`/api/tournaments?type=free&offset=0&limit=100&sort=newest`).then(r => r.json()),
          fetch(`/api/tournaments?type=standard&offset=0&limit=100&sort=newest`).then(r => r.json()),
          fetch(`/api/tournaments?type=recent&offset=0&limit=100&sort=newest`).then(r => r.json())
        ]);

        // Deduplicate by _id (active tournaments may also appear in recent)
        const seen = new Set<string>();
        const allTournaments: Tournament[] = [];
        for (const t of [
          ...(freeData.tournaments || []),
          ...(paidData.tournaments || []),
          ...(recentData.tournaments || [])
        ]) {
          const id = t._id?.toString();
          if (id && !seen.has(id)) {
            seen.add(id);
            allTournaments.push(t);
          }
        }

        setTournaments(allTournaments);

        // Calculate stats
        const now = new Date();
        const active = allTournaments.filter((t: Tournament) => {
          const start = new Date(t.startTime);
          const end = new Date(t.endTime);
          return t.isActive && start <= now && end >= now;
        });

        const totalPrize = allTournaments
          .filter((t: Tournament) => t.type === 'paid')
          .reduce((sum: number, t: Tournament) => sum + (t.prizePool || 0), 0);

        const totalPlayers = allTournaments.reduce(
          (sum: number, t: Tournament) => sum + (t.users?.length || 0),
          0
        );

        setStats({
          activeTournaments: active.length,
          totalPrizePool: totalPrize,
          totalPlayers: totalPlayers
        });

      } catch (error) {
        console.error(`Error loading tournaments: ${error}`);
      } finally {
        setLoading(false);
      }
    }

    loadTournaments();
  }, []);

  useEffect(() => {
    fetch("/api/tournaments/ladder/me")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setLadderData(data); })
      .catch(() => {})
      .finally(() => setLadderLoading(false));
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...tournaments];
    const now = new Date();

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((t: Tournament) => {
        const start = new Date(t.startTime);
        const end = new Date(t.endTime);
        return t.isActive && start <= now && end >= now;
      });
    } else if (statusFilter === 'upcoming') {
      filtered = filtered.filter((t: Tournament) => {
        const start = new Date(t.startTime);
        return t.isActive && start > now;
      });
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter((t: Tournament) => {
        const end = new Date(t.endTime);
        return end < now || t.haveWinners;
      });
    }

    // Type filter
    if (typeFilter === 'free_play') {
      filtered = filtered.filter((t: Tournament) => t.type === 'free_play');
    } else if (typeFilter === 'paid') {
      filtered = filtered.filter((t: Tournament) => t.type === 'paid');
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((t: Tournament) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'ending_soon') {
      filtered.sort((a: Tournament, b: Tournament) =>
        new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      );
    } else if (sortBy === 'prize_pool') {
      filtered.sort((a: Tournament, b: Tournament) =>
        (b.prizePool || 0) - (a.prizePool || 0)
      );
    } else if (sortBy === 'newest') {
      filtered.sort((a: Tournament, b: Tournament) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    }

    setFilteredTournaments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [tournaments, statusFilter, typeFilter, sortBy, searchQuery]);

  // Paginated tournaments
  const paginatedTournaments = filteredTournaments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Tournaments</h1>
        <p className="text-xl text-gray-400">
          Compete against others for real prizes
        </p>
      </div>

      {/* Stats Bar */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-white/[0.08] bg-[#16181f] p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#E94560]/20 p-3">
              <Trophy className="h-6 w-6 text-[#E94560]" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Active Tournaments</div>
              <div className="font-['JetBrains_Mono'] text-2xl font-bold text-white">
                {stats.activeTournaments}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-white/[0.08] bg-[#16181f] p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#00D4AA]/20 p-3">
              <DollarSign className="h-6 w-6 text-[#00D4AA]" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Prize Pool</div>
              <div className="font-['JetBrains_Mono'] text-2xl font-bold text-[#00D4AA]">
                ${stats.totalPrizePool.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-white/[0.08] bg-[#16181f] p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#FFB547]/20 p-3">
              <Users className="h-6 w-6 text-[#FFB547]" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Players Competing</div>
              <div className="font-['JetBrains_Mono'] text-2xl font-bold text-white">
                {stats.totalPlayers}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* No-active banner (shown when pool has entries but none are running) */}
      {!loading && stats.activeTournaments === 0 && tournaments.length > 0 && (
        <div className="mb-6 rounded-md border border-[#FFB547]/30 bg-[#FFB547]/10 p-4 text-sm text-[#FFB547]">
          <strong>No active tournaments right now.</strong> The next batch starts{" "}
          <span className="font-semibold text-white">
            {getNextTournamentBatch().toLocaleString(undefined, {
              weekday: "long",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </span>
          . Browse recent results below.
        </div>
      )}

      {/* Risk Disclosure */}
      <div className="mb-8 rounded-md border border-orange-800/30 bg-orange-900/20 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 flex-shrink-0 text-orange-500" />
          <div>
            <p className="text-sm text-orange-400">
              <strong>Risk Disclosure:</strong> Velocity Markets is intended for
              entertainment purposes. While we offer paid games with real
              prizes, these involve financial risk. A 12% platform fee is
              applied to tournament entries. Never participate with money you
              cannot afford to lose.
            </p>
          </div>
        </div>
      </div>

      {/* Ladder progress card */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-sm">My Tier</h3>
          <Link
            href="/tournaments/ladder"
            className="text-[#E94560] text-xs hover:underline transition-colors"
          >
            View ladder →
          </Link>
        </div>
        <LadderProgress data={ladderData} loading={ladderLoading} />
      </div>

      {/* Filter Bar */}
      <div className="mb-8 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? 'bg-[#E94560]' : ''}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('active')}
            className={statusFilter === 'active' ? 'bg-[#E94560]' : ''}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('upcoming')}
            className={statusFilter === 'upcoming' ? 'bg-[#E94560]' : ''}
          >
            Upcoming
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('completed')}
            className={statusFilter === 'completed' ? 'bg-[#E94560]' : ''}
          >
            Completed
          </Button>
        </div>

        {/* Type and Sort Dropdowns + Search */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-gray-400">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="w-full rounded-md border border-white/[0.08] bg-[#16181f] p-2 text-white"
            >
              <option value="all">All Types</option>
              <option value="free_play">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-md border border-white/[0.08] bg-[#16181f] p-2 text-white"
            >
              <option value="ending_soon">Ending Soon</option>
              <option value="prize_pool">Prize Pool</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <Card
              key={i}
              className="animate-pulse overflow-hidden border-[#333333] bg-[#2C2C2C]"
            >
              <div className="aspect-video bg-[#333333]"></div>
              <div className="p-6">
                <div className="mb-4 h-7 rounded bg-[#333333]"></div>
                <div className="mb-6 h-4 rounded bg-[#333333]"></div>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 h-3 w-20 rounded bg-[#333333]"></div>
                    <div className="h-5 w-16 rounded bg-[#333333]"></div>
                  </div>
                  <div>
                    <div className="mb-2 h-3 w-20 rounded bg-[#333333]"></div>
                    <div className="h-5 w-16 rounded bg-[#333333]"></div>
                  </div>
                </div>
                <div className="h-10 rounded bg-[#333333]"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredTournaments.length === 0 ? (
        (() => {
          const poolEmpty = tournaments.length === 0;
          const next = getNextTournamentBatch();
          const nextLabel = next.toLocaleString(undefined, {
            weekday: "long",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          });
          return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-[#16181f] p-12 text-center">
              <Trophy className="mb-4 h-16 w-16 text-gray-600" />
              <h3 className="mb-2 text-xl font-bold">
                {poolEmpty ? "No active tournaments right now" : "No tournaments match those filters"}
              </h3>
              <p className="mb-6 text-gray-400">
                {poolEmpty
                  ? <>The next batch of tournaments starts <span className="font-semibold text-white">{nextLabel}</span>.</>
                  : "Try adjusting your filters or clearing the search"}
              </p>
              <Link href="/auction_details">
                <Button asChild className="bg-[#E94560] hover:bg-[#E94560]/90">
                  Browse Auctions
                </Button>
              </Link>
            </div>
          );
        })()
      ) : (
        <>
          <TournamentGrid tournaments={paginatedTournaments} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className=""
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-[#E94560]' : ''}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className=""
              >
                Next
              </Button>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTournaments.length)} of {filteredTournaments.length} tournaments
          </div>
        </>
      )}
    </div>
  );
}
