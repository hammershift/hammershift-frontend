import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Bot,
  CircleDollarSign,
  Gauge,
  Heart,
  RefreshCw,
  Scale,
  Shield,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#0A0A1A]">
      <div className="container mx-auto px-4 py-16 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#E94560] text-sm font-mono font-semibold tracking-widest uppercase mb-3">
            Platform Guide
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            How It Works
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Velocity Markets lets you predict what cars will sell for at auction.
            Buy YES or NO shares on live prediction markets powered by real
            Bring a Trailer auctions. If you&apos;re right, you profit.
          </p>
        </div>

        {/* ── SECTION 1: Getting Started ───────────────────────────── */}
        <SectionHeader label="Getting Started" />

        <StepCard
          step="01"
          icon={<Users className="w-6 h-6" />}
          title="Create Your Account"
          description="Sign up with Google or email. It takes 30 seconds. Once you're in, you have access to every live market on the platform."
        />
        <StepCard
          step="02"
          icon={<CircleDollarSign className="w-6 h-6" />}
          title="Add Funds"
          description="Deposit via credit card or debit card through our secure payment partner, Stripe. Your balance is stored in your Velocity Markets wallet and is available for trading immediately."
        />
        <StepCard
          step="03"
          icon={<BarChart3 className="w-6 h-6" />}
          title="Browse Markets"
          description="Each market is tied to a real Bring a Trailer auction. Our AI sets an opening price line — the predicted sale price. You decide: will the car sell ABOVE or BELOW that line?"
        />
        <StepCard
          step="04"
          icon={<TrendingUp className="w-6 h-6" />}
          title="Place Your Trade"
          description="Pick YES (sells above the line) or NO (sells below). Enter your dollar amount. You'll see your share price, the number of shares you'll receive, and the potential payout — all before you confirm."
        />
        <StepCard
          step="05"
          icon={<Trophy className="w-6 h-6" />}
          title="Collect Your Winnings"
          description="When the auction ends, the actual sale price determines the winner. If you're right, your shares resolve at $1.00 each. If you're wrong, they resolve at $0.00. Winnings are credited to your wallet automatically."
        />

        {/* ── SECTION 2: How Pricing Works ─────────────────────────── */}
        <SectionHeader label="How Pricing Works" />

        <InfoCard
          icon={<Scale className="w-5 h-5 text-[#00D4AA]" />}
          title="The Prediction Market"
        >
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            Every market has two sides: <strong className="text-white">YES</strong> and{" "}
            <strong className="text-white">NO</strong>. Share prices always add up to{" "}
            <span className="font-mono text-white">$1.00</span>.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            If the YES price is <span className="font-mono text-[#00D4AA]">$0.60</span>,
            that means the crowd thinks there&apos;s a 60% chance the car sells above the line.
            NO would be <span className="font-mono text-[#E94560]">$0.40</span>.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            When more people buy YES, the YES price rises (it gets more expensive to buy).
            When more people buy NO, the YES price drops. Prices adjust automatically
            based on where the money flows.
          </p>
        </InfoCard>

        <InfoCard
          icon={<Gauge className="w-5 h-5 text-[#FFB547]" />}
          title="Share Prices and Returns"
        >
          <div className="space-y-3">
            <Row label="Buy YES at $0.40, car sells above line" value="You receive $1.00 per share → 150% return" color="text-[#00D4AA]" />
            <Row label="Buy YES at $0.40, car sells below line" value="Shares worth $0.00 → you lose your bet" color="text-[#E94560]" />
            <Row label="Buy NO at $0.25, car sells below line" value="You receive $1.00 per share → 300% return" color="text-[#00D4AA]" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mt-4">
            The cheaper the shares when you buy, the higher your potential return —
            but cheaper shares mean the crowd disagrees with you.
          </p>
        </InfoCard>

        {/* ── SECTION 3: AI Pricing Engine ─────────────────────────── */}
        <SectionHeader label="AI Pricing Engine" />

        <InfoCard
          icon={<Bot className="w-5 h-5 text-[#E94560]" />}
          title="How We Set the Opening Line"
        >
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Every market starts with an AI-generated prediction. Here&apos;s how:
          </p>
          <div className="space-y-4">
            <NumberedStep n={1} title="Find Comparable Sales">
              We search thousands of completed Bring a Trailer auctions
              for the same make, model, and similar year. This gives us a
              statistical baseline — the median price, price range, and trend.
            </NumberedStep>
            <NumberedStep n={2} title="AI Analysis">
              Claude AI analyzes the specific listing — mileage, trim level,
              modifications, no-reserve status, and condition signals. It
              identifies what makes this car worth more or less than average
              and adjusts the price accordingly.
            </NumberedStep>
            <NumberedStep n={3} title="Set the Line">
              The AI&apos;s recommendation becomes the over/under line for the
              market. After that, the crowd moves the price with their trades.
              Think of the AI as the opening oddsmaker — the public adjusts
              from there.
            </NumberedStep>
          </div>
        </InfoCard>

        {/* ── SECTION 4: Fees ──────────────────────────────────────── */}
        <SectionHeader label="Fees" />

        <InfoCard
          icon={<CircleDollarSign className="w-5 h-5 text-[#FFB547]" />}
          title="Platform Fees"
        >
          <div className="space-y-3 mb-4">
            <Row
              label="Trading fee (on entry)"
              value="2% of your trade amount"
              color="text-white"
            />
            <Row
              label="Settlement fee (on winnings)"
              value="2% of your payout"
              color="text-white"
            />
            <Row
              label="Total platform rake"
              value="Up to 4% per round trip"
              color="text-[#FFB547]"
            />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            There are no account fees, no subscription fees, and no withdrawal fees.
            You only pay when you trade and when you win.
          </p>
        </InfoCard>

        {/* ── SECTION 5: Settlement & Safety ──────────────────────── */}
        <SectionHeader label="Settlement & Safety" />

        <InfoCard
          icon={<Zap className="w-5 h-5 text-[#00D4AA]" />}
          title="How Settlement Works"
        >
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            When a Bring a Trailer auction ends, the final hammer price is
            recorded. If the car sold <strong className="text-white">above</strong> the
            predicted line, <strong className="text-[#00D4AA]">YES wins</strong>. If it sold{" "}
            <strong className="text-white">below</strong>, <strong className="text-[#E94560]">NO wins</strong>.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Winning shares resolve at{" "}
            <span className="font-mono text-white">$1.00</span> each (minus the 2%
            settlement fee). Losing shares resolve at{" "}
            <span className="font-mono text-white">$0.00</span>. Payouts are
            credited to your wallet automatically — no action required.
          </p>
        </InfoCard>

        <InfoCard
          icon={<Shield className="w-5 h-5 text-[#00D4AA]" />}
          title="Solvency Guarantee"
        >
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            Before paying anyone, the system verifies that there is enough real
            money from actual trades to cover all winner payouts. Winners are
            paid exclusively from real user deposits — the platform never pays
            from its own funds and never creates phantom money.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-white">Real dollars in = real dollars out.</strong>{" "}
            Losers fund winners. The math guarantees solvency.
          </p>
        </InfoCard>

        <InfoCard
          icon={<RefreshCw className="w-5 h-5 text-[#FFB547]" />}
          title="Refund Protection"
        >
          <p className="text-gray-400 text-sm leading-relaxed">
            If a market doesn&apos;t have enough activity on both sides to fully
            pay winners, every participant is refunded their original trade
            amount. Nobody wins, nobody loses. The market is closed and marked
            as insufficient liquidity. You always either win, lose your bet, or
            get your money back — never anything in between.
          </p>
        </InfoCard>

        {/* ── SECTION 6: Platform Economics ────────────────────────── */}
        <SectionHeader label="Platform Economics" />

        <InfoCard
          icon={<BarChart3 className="w-5 h-5 text-[#E94560]" />}
          title="Where the Money Goes"
        >
          <div className="space-y-3 mb-4">
            <Row
              label="Your trade amount"
              value="98% enters the market pool, 2% platform fee"
              color="text-white"
            />
            <Row
              label="If you win"
              value="$1.00 per share minus 2% settlement fee"
              color="text-[#00D4AA]"
            />
            <Row
              label="If you lose"
              value="$0.00 — your money stays in the pool to pay winners"
              color="text-[#E94560]"
            />
            <Row
              label="Platform risk"
              value="Zero — Velocity Markets never takes a position"
              color="text-[#FFB547]"
            />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            The platform operates as a neutral exchange. It collects fees, facilitates
            trades, and settles markets. It does not bet, does not take sides, and
            has no financial exposure to any outcome.
          </p>
        </InfoCard>

        {/* ── SECTION 7: Support ──────────────────────────────────── */}
        <SectionHeader label="Support" />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <InfoCard
            icon={<Heart className="w-5 h-5 text-[#E94560]" />}
            title="Need Help?"
          >
            <p className="text-gray-400 text-sm leading-relaxed">
              Contact us at{" "}
              <a href="mailto:support@velocity-markets.com" className="text-[#E94560] hover:underline">
                support@velocity-markets.com
              </a>{" "}
              for account issues, payment questions, or general feedback.
              We typically respond within 24 hours.
            </p>
          </InfoCard>

          <InfoCard
            icon={<Shield className="w-5 h-5 text-[#00D4AA]" />}
            title="Privacy & Security"
          >
            <p className="text-gray-400 text-sm leading-relaxed">
              All payments are processed securely through Stripe. We never store
              your card details. Personal information is encrypted and protected
              under industry-standard security practices.
            </p>
          </InfoCard>
        </div>

        {/* ── CTA Banner ──────────────────────────────────────────── */}
        <div className="relative bg-[#16181f] border border-white/[0.08] rounded-xl p-8 md:p-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E94560]/5 via-transparent to-[#00D4AA]/5 pointer-events-none" />
          <div className="relative">
            <Trophy className="w-8 h-8 text-[#E94560] mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              Ready to Make Your Prediction?
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base mb-6">
              Browse live markets, study the AI prediction, and trade on what you
              think a car will sell for. Your knowledge of the market is your edge.
            </p>
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 bg-[#E94560] hover:bg-[#E94560]/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Markets
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Reusable sub-components ────────────────────────────────────────────── */

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 mt-14 first:mt-0">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-xs font-mono font-semibold text-white/40 tracking-widest uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#16181f] border border-white/[0.08] rounded-xl p-6 md:p-8 flex gap-6 items-start hover:border-white/[0.14] transition-colors duration-200 mb-4">
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] flex items-center justify-center">
          {icon}
        </div>
        <span className="font-mono text-xs text-white/30 font-semibold tracking-widest">
          {step}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white tracking-widest mb-2 uppercase">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed text-sm md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#16181f] border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.14] transition-colors duration-200 mb-4">
      <h3 className="flex items-center gap-2.5 text-base font-bold text-white uppercase tracking-widest mb-4">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`font-mono text-sm ${color}`}>{value}</span>
    </div>
  );
}

function NumberedStep({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 flex items-center justify-center">
        <span className="font-mono text-xs text-[#E94560] font-bold">{n}</span>
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
