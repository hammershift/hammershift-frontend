"use client";
import CohortCounter from "./CohortCounter";
import BlurredSampleCards from "./BlurredSampleCards";
import WinnersTicker from "./WinnersTicker";
import WaitlistDashboard from "./WaitlistDashboard";
import WaitlistSignupForm from "./WaitlistSignupForm";
interface Props { mode: "cold" | "waitlisted"; email?: string; referralCode?: string; }
export default function GatePageClient({ mode, email, referralCode }: Props) {
  return (
    <section className="min-h-screen bg-[#0A0A1A] text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Velocity Markets — <span className="text-[#E94560]">Invite-Only</span>
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Predict auction hammer prices. Win real money. Founding cohort closes at 1,000 predictors.
        </p>
        {mode === "cold" && (
          <div data-testid="gate-cold">
            <WaitlistSignupForm />
            <CohortCounter />
            <BlurredSampleCards />
            <WinnersTicker />
          </div>
        )}
        {mode === "waitlisted" && (
          <div data-testid="gate-waitlisted">
            {referralCode ? (
              <WaitlistDashboard referralCode={referralCode} />
            ) : (
              <span>waitlisted as {email}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
