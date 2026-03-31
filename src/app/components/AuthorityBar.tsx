export default function AuthorityBar() {
  const houses = [
    { name: 'Bring a Trailer', abbr: 'BaT' },
    { name: "RM Sotheby's", abbr: "RM Sotheby's" },
    { name: 'Mecum Auctions', abbr: 'Mecum' },
    { name: 'Gooding & Company', abbr: 'Gooding' },
  ];

  return (
    <section
      className="w-full border-t border-white/[0.08] bg-[#0A0A1A] py-8"
      aria-label="Auction data sources"
    >
      <div className="mx-auto max-w-5xl px-4">
        <p className="mb-5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
          Real-time data from leading auction houses
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {houses.map((h) => (
            <span
              key={h.name}
              className="text-base font-semibold tracking-wide text-gray-400/80 transition hover:text-gray-300"
              title={h.name}
            >
              {h.abbr}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
