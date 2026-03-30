export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-[#1a1a1a] rounded w-1/3 mb-4" />
        <div className="h-4 bg-[#2a2a2a] rounded w-2/3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
            <div className="h-48 bg-[#222222]" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-[#2a2a2a] rounded w-3/4" />
              <div className="h-3 bg-[#2a2a2a] rounded w-1/2" />
              <div className="h-10 bg-[#2a2a2a] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
