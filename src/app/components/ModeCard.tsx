import Link from "next/link";

interface ModeCardProps {
  icon: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  accent: string;
}

export function ModeCard({ icon, title, description, cta, href, accent }: ModeCardProps) {
  return (
    <Link href={href}>
      <div
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6
                   hover:border-[#01696F]/50 transition-all duration-200
                   hover:shadow-lg hover:shadow-[#01696F]/10 cursor-pointer h-full"
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>
        <span
          className="inline-block text-sm font-semibold px-4 py-2 rounded-lg"
          style={{ backgroundColor: accent, color: "#000000" }}
        >
          {cta} &rarr;
        </span>
      </div>
    </Link>
  );
}
