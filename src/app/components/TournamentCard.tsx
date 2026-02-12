"use client";

import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "./CountdownTimer";
import { Tournament } from "@/models/tournament.model";
import { Users, Trophy, Ticket } from "lucide-react";

/**
 * TournamentCard Component
 *
 * Displays a tournament with banner, status, stats, and CTA button.
 * Shows different states: LIVE, UPCOMING, FREE, PAID, FULL.
 *
 * @param tournament - Tournament data object
 * @param userStatus - User's participation status: 'joined' | 'eligible' | 'full'
 */

interface TournamentCardProps {
  tournament: Tournament;
  userStatus?: "joined" | "eligible" | "full";
}

type TournamentStatus = "LIVE" | "UPCOMING" | "ENDED";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getTournamentStatus = (
  startTime: Date,
  endTime: Date
): TournamentStatus => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now >= end) return "ENDED";
  if (now >= start && now < end) return "LIVE";
  return "UPCOMING";
};

const getStatusBadgeConfig = (status: TournamentStatus, isFree: boolean) => {
  if (status === "LIVE") {
    return {
      label: "LIVE",
      bgColor: "bg-[#E94560]",
      textColor: "text-white",
      animate: true,
    };
  }
  if (status === "UPCOMING") {
    return {
      label: isFree ? "FREE" : "UPCOMING",
      bgColor: isFree ? "bg-[#00D4AA]" : "bg-[#FFB547]",
      textColor: isFree ? "text-[#0A0A1A]" : "text-white",
      animate: false,
    };
  }
  return {
    label: "ENDED",
    bgColor: "bg-[#64748B]",
    textColor: "text-white",
    animate: false,
  };
};

const getCtaConfig = (
  status: TournamentStatus,
  userStatus?: "joined" | "eligible" | "full"
) => {
  if (status === "ENDED") {
    return {
      label: "View Results",
      disabled: false,
      variant: "secondary" as const,
    };
  }

  if (status === "LIVE") {
    if (userStatus === "joined") {
      return {
        label: "View Leaderboard",
        disabled: false,
        variant: "primary" as const,
      };
    }
    return {
      label: "Tournament in Progress",
      disabled: true,
      variant: "secondary" as const,
    };
  }

  // UPCOMING
  if (userStatus === "full") {
    return {
      label: "Full",
      disabled: true,
      variant: "secondary" as const,
    };
  }

  if (userStatus === "joined") {
    return {
      label: "Entered",
      disabled: false,
      variant: "success" as const,
    };
  }

  return {
    label: "Enter Tournament",
    disabled: false,
    variant: "primary" as const,
  };
};

export default function TournamentCard({
  tournament,
  userStatus,
}: TournamentCardProps) {
  const isFree = tournament.type === "free_play" || tournament.buyInFee === 0;
  const status = getTournamentStatus(tournament.startTime, tournament.endTime);
  const statusBadge = getStatusBadgeConfig(status, isFree);
  const ctaConfig = getCtaConfig(status, userStatus);

  const participantCount = tournament.users?.length || 0;
  const maxParticipants = tournament.max_participants || tournament.maxUsers;
  const isFull = participantCount >= maxParticipants;

  const timeToShow =
    status === "UPCOMING" ? tournament.startTime : tournament.endTime;

  return (
    <article
      className="
        group relative overflow-hidden rounded-lg
        border border-[#1E293B] bg-[#12122A]
        transition-all duration-300
        hover:border-[#E94560] hover:shadow-lg
        hover:shadow-[#E94560]/20 hover:scale-[1.02]
      "
    >
      {/* Banner Image */}
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#1A1A3E]">
        <Image
          src={tournament.featured_image || tournament.banner}
          alt={tournament.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />

        {/* Status Badge Overlay */}
        <div className="absolute left-3 top-3">
          <span
            className={`
              ${statusBadge.bgColor} ${statusBadge.textColor}
              rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wide
              ${statusBadge.animate ? "animate-pulse" : ""}
            `}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Type Badge (PAID) */}
        {!isFree && (
          <div className="absolute right-3 top-3">
            <span className="rounded bg-[#FFB547] px-3 py-1.5 text-xs font-bold uppercase text-[#0A0A1A]">
              PAID
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Tournament Name */}
        <h3 className="mb-4 text-xl font-bold text-white line-clamp-2">
          {tournament.name}
        </h3>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {/* Prize Pool */}
          <div className="flex items-start gap-2">
            <Trophy className="mt-0.5 h-4 w-4 text-[#FFB547]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Prize Pool</p>
              <p className="font-mono text-base font-bold text-[#00D4AA]">
                {formatCurrency(tournament.prizePool)}
              </p>
            </div>
          </div>

          {/* Entry Fee */}
          <div className="flex items-start gap-2">
            <Ticket className="mt-0.5 h-4 w-4 text-[#00D4AA]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Entry Fee</p>
              <p className="font-mono text-base font-bold text-white">
                {isFree ? "FREE" : formatCurrency(tournament.buyInFee)}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 text-[#E94560]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Participants</p>
              <p className="font-mono text-base font-bold text-white">
                {participantCount} / {maxParticipants}
                {isFull && (
                  <span className="ml-2 text-xs font-normal text-[#E94560]">FULL</span>
                )}
              </p>
            </div>
          </div>

          {/* Auctions */}
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 text-[#94A3B8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-xs text-[#94A3B8]">Auctions</p>
              <p className="font-mono text-base font-bold text-white">
                {tournament.auction_ids?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mb-4 rounded-lg bg-[#1A1A3E] px-3 py-2">
          <p className="mb-1 text-xs text-[#94A3B8]">
            {status === "UPCOMING" ? "Starts in" : status === "LIVE" ? "Ends in" : "Ended"}
          </p>
          {status !== "ENDED" ? (
            <CountdownTimer endTime={timeToShow} size="md" />
          ) : (
            <p className="font-mono text-base text-[#64748B]">Tournament Ended</p>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={
            status === "LIVE" || userStatus === "joined"
              ? `/tournaments/${tournament.tournament_id}/leaderboard`
              : status === "ENDED"
                ? `/tournaments/${tournament.tournament_id}/results`
                : `/tournaments/${tournament.tournament_id}`
          }
          className={`
            block w-full rounded-lg px-4 py-3 text-center
            font-semibold transition-all
            ${
              ctaConfig.variant === "primary"
                ? "bg-[#E94560] text-white hover:bg-[#ff5571]"
                : ctaConfig.variant === "success"
                  ? "bg-[#00D4AA] text-[#0A0A1A] hover:bg-[#00f5c4]"
                  : "bg-[#1A1A3E] text-[#94A3B8]"
            }
            ${ctaConfig.disabled ? "cursor-not-allowed opacity-50" : ""}
          `}
          aria-disabled={ctaConfig.disabled}
          onClick={(e) => {
            if (ctaConfig.disabled) {
              e.preventDefault();
            }
          }}
        >
          {ctaConfig.label}
        </Link>

        {/* Description (if exists) */}
        {tournament.description && (
          <p className="mt-3 text-sm text-[#64748B] line-clamp-2">
            {tournament.description}
          </p>
        )}
      </div>
    </article>
  );
}
