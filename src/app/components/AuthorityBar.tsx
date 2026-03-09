export default function AuthorityBar() {
  const houses = [
    { name: 'Bring a Trailer', abbr: 'BaT' },
    { name: "RM Sotheby's", abbr: 'RM' },
    { name: 'Mecum', abbr: 'MECUM' },
    { name: 'Gooding & Company', abbr: 'GOODING' },
  ];

  return (
    <div className="w-full border-t border-[#1E2A36] bg-[#0A0A1A] py-6">
      <div className="mx-auto max-w-5xl px-4">
        <p className="mb-4 text-center text-xs uppercase tracking-widest text-gray-600">
          Auction data sourced from
        </p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {houses.map((h) => (
            <span
              key={h.abbr}
              className="font-mono text-sm font-bold tracking-wider text-gray-600 opacity-60"
            >
              {h.abbr}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
