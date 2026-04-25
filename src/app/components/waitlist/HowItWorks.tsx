const STEPS = [
  {
    n: 1,
    title: "Pick an auction",
    body: "Live Bring a Trailer listings, curated for clear edge.",
  },
  {
    n: 2,
    title: "Call the range",
    body: "Predict where the hammer will actually land.",
  },
  {
    n: 3,
    title: "Collect USD",
    body: "Paid to your wallet when your call clears the spread.",
  },
];

export default function HowItWorks() {
  return (
    <section
      aria-label="How Velocity Markets works"
      className="border-t border-white/[0.06] bg-[#0A0A1A]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-10">
          How it works
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-5">
              <div className="font-mono text-2xl text-[#E94560] shrink-0 leading-none pt-1">
                0{s.n}
              </div>
              <div>
                <div className="text-white font-semibold text-lg">{s.title}</div>
                <div className="text-gray-400 text-sm mt-1.5 leading-relaxed">
                  {s.body}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
