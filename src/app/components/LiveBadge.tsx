export default function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f44b5a]/20 text-[#f44b5a] uppercase tracking-wider">
      <span className="h-1.5 w-1.5 rounded-full bg-[#f44b5a] animate-pulse" />
      Live
    </span>
  );
}
