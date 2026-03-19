"use client";

interface CategoryFilterBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES: ({ label: string; value: string } | null)[] = [
  { label: "All", value: "all" },
  { label: "\u{1F525} Trending", value: "trending" },
  { label: "\u23F0 Ending Soon", value: "ending_soon" },
  { label: "\u{1F195} New", value: "new" },
  null, // divider
  { label: "Ferrari", value: "ferrari" },
  { label: "Porsche", value: "porsche" },
  { label: "Mercedes", value: "mercedes" },
  { label: "BMW", value: "bmw" },
  { label: "American Muscle", value: "american_muscle" },
  { label: "JDM", value: "jdm" },
  { label: "Classic", value: "classic" },
  { label: "Under $25K", value: "under_25k" },
  { label: "Over $100K", value: "over_100k" },
];

export default function CategoryFilterBar({
  activeCategory,
  onCategoryChange,
}: CategoryFilterBarProps) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {CATEGORIES.map((cat, i) => {
        if (cat === null) {
          return (
            <div
              key={`div-${i}`}
              className="h-5 w-px bg-white/10 shrink-0"
            />
          );
        }
        const isActive = activeCategory === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              isActive
                ? "bg-white text-[#0A0A1A] font-medium"
                : "bg-white/[0.08] text-[#8b8fa8] hover:bg-white/[0.12] hover:text-gray-300"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
