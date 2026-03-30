export default function MarketCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#16181f] flex flex-col animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video bg-white/[0.05]" />
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title lines */}
        <div className="h-4 bg-white/[0.05] rounded w-3/4" />
        <div className="h-3 bg-white/[0.05] rounded w-full" />
        {/* Probability */}
        <div className="h-6 bg-white/[0.05] rounded w-1/3" />
        {/* Buttons */}
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-[#00D4AA]/10 rounded-lg" />
          <div className="flex-1 h-9 bg-[#01696F]/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
