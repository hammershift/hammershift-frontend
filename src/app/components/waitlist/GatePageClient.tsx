"use client";
import CohortCounter from "./CohortCounter";
import GateFaq from "./GateFaq";
import GateHero from "./GateHero";
import HowItWorks from "./HowItWorks";
import WaitlistDashboard from "./WaitlistDashboard";
import WaitlistSignupForm from "./WaitlistSignupForm";
import WinnersTicker from "./WinnersTicker";

interface Props {
  mode: "cold" | "waitlisted";
  email?: string;
  referralCode?: string;
}

export default function GatePageClient({ mode, email, referralCode }: Props) {
  return (
    <div className="bg-[#0A0A1A]">
      {/* Suppress the site-wide chrome; the gate runs its own branding. */}
      <style>{`
        header[role="banner"],
        footer[role="contentinfo"] { display: none !important; }
      `}</style>

      <GateHero>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white mb-5">
          You&rsquo;ve been predicting these prices
          <br />
          <span className="text-[#E94560]">in your head for years.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
          Predict car auction prices. Win real money. Founding members keep
          it for life.
        </p>

        {mode === "cold" && (
          <div data-testid="gate-cold">
            <WaitlistSignupForm />
            <CohortCounter />
          </div>
        )}

        {mode === "waitlisted" && (
          <div data-testid="gate-waitlisted">
            {referralCode ? (
              <WaitlistDashboard referralCode={referralCode} />
            ) : (
              <span className="text-gray-300">Waitlisted as {email}</span>
            )}
          </div>
        )}
      </GateHero>

      <WinnersTicker />
      <HowItWorks />
      <GateFaq />
    </div>
  );
}
