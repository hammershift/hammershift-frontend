import Image from "next/image";
import Link from "next/link";

interface Props {
  displayName: string;
  handle: string;
  avatarUrl?: string;
  createdAt: Date | string;
  stats: {
    predictions: number;
    accuracyPct: number;
    streak: number;
    earningsUsd: number;
    rank: number | null;
  };
}

const HERO_BG = "/images/gate/hero-sonoma-sunset.jpg";

function fmtMonth(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

export default function ProfileHero({
  displayName,
  handle,
  avatarUrl,
  createdAt,
  stats,
}: Props) {
  return (
    <section
      data-testid="profile-hero"
      aria-label="Profile header"
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A0A1A]"
    >
      <div className="absolute inset-0">
        <Image
          src={HERO_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #0A0A1A 0%, rgba(10,10,26,0.85) 60%, rgba(10,10,26,0.5) 100%)",
          }}
        />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="shrink-0">
            {avatarUrl ? (
              <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-full overflow-hidden ring-2 ring-[#E94560]/40">
                <Image
                  src={avatarUrl}
                  alt={`${displayName} avatar`}
                  fill
                  sizes="(max-width: 768px) 64px, 96px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-[#13202D] ring-2 ring-[#E94560]/40 flex items-center justify-center text-xl md:text-3xl font-bold text-white">
                {initials(displayName)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                  {displayName}
                </h1>
                <div className="mt-1 flex items-center gap-2 flex-wrap text-sm">
                  <span className="text-gray-300 font-mono">{`@${handle}`}</span>
                  <span aria-hidden className="text-gray-600">
                    ·
                  </span>
                  <span className="inline-flex items-center font-mono uppercase tracking-[0.15em] text-xs px-2 py-0.5 rounded text-[#E94560] bg-[#E94560]/10 border border-[#E94560]/30">
                    Founding member
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {`Founding member since ${fmtMonth(createdAt)}`}
                </p>
              </div>
              {/* Spoke route — created in Task 5.1 of docs/plans/2026-04-27-profile-redesign-plan.md */}
              <Link
                href="/profile/settings"
                className="shrink-0 text-sm text-gray-300 hover:text-white border border-white/[0.08] rounded-lg px-3 py-2 transition"
              >
                Edit profile →
              </Link>
            </div>
          </div>
        </div>

        <StatStripe stats={stats} />
      </div>
    </section>
  );
}

function StatStripe({ stats }: { stats: Props["stats"] }) {
  const cells = [
    { label: "Predictions", value: stats.predictions.toLocaleString() },
    { label: "Accuracy", value: `${Math.round(stats.accuracyPct)}%` },
    { label: "Streak", value: `${stats.streak}` },
    {
      label: "Earnings",
      value: `$${Math.round(stats.earningsUsd).toLocaleString()}`,
    },
    { label: "Rank", value: stats.rank ? `#${stats.rank}` : "—" },
  ];
  return (
    <div
      data-testid="profile-stat-stripe"
      className="mt-6 md:mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-4 border-t border-white/[0.06] pt-5"
    >
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={`flex flex-col px-3 ${i > 0 ? "lg:border-l lg:border-white/[0.06]" : ""}`}
        >
          <span className="font-mono text-2xl md:text-3xl text-white tabular-nums">
            {c.value}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.15em] text-gray-500">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
