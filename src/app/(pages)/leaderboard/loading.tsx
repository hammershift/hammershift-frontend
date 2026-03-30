export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-[#1a1a1a] rounded w-1/4 mb-4" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
            <div className="h-8 w-8 bg-[#2a2a2a] rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#2a2a2a] rounded w-1/3" />
              <div className="h-3 bg-[#2a2a2a] rounded w-1/4" />
            </div>
            <div className="h-6 bg-[#2a2a2a] rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
