import Link from "next/link";

const FOOTER_LINKS = {
  Markets: [
    { label: "Browse All", href: "/markets" },
    { label: "Trending", href: "/markets?sort=trending" },
    { label: "Ending Soon", href: "/markets?sort=ending_soon" },
    { label: "Resolved", href: "/markets?status=resolved" },
  ],
  Learn: [
    { label: "How It Works", href: "/how_it_works" },
    { label: "FAQ", href: "/faq" },
    { label: "Terms of Service", href: "/terms_of_service" },
    { label: "Privacy Policy", href: "/privacy_policy" },
  ],
  Community: [
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Discord", href: "#" },
    { label: "Twitter / X", href: "#" },
    { label: "Instagram", href: "#" },
  ],
  Company: [
    { label: "About", href: "/how_it_works" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Press", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0A0A1A]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Link grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-3 text-sm font-semibold text-white">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/[0.05]" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Velocity Markets</p>
            <p className="text-xs text-gray-600 mt-0.5">The prediction market for collector car auctions</p>
          </div>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Velocity Markets. All rights reserved.
          </p>
        </div>

        {/* Risk disclaimer */}
        <div className="mt-6 rounded-lg bg-white/[0.02] border border-white/[0.05] px-4 py-3">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            <strong className="text-gray-500">Risk Disclaimer:</strong> Trading on prediction markets involves risk.
            Past performance is not indicative of future results. Only trade with funds you can afford to lose.
            Velocity Markets is not a financial advisor and does not provide investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
