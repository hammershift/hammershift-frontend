"use client";

interface Props<T extends string> {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

export default function SpokeSegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  // We use the ARIA APG tablist pattern (not radiogroup) because these toggles
  // change a URL filter, not a form value, and because we want a single tab
  // stop with the active option visibly selected. Per the APG, tablist permits
  // Tab-only navigation when the selected indicator is visible. Arrow-key
  // cycling is not implemented here — acceptable for a filter strip where
  // each option is a separate, visually-distinct button. If we add more
  // options later, consider adding ArrowLeft/ArrowRight focus cycling.
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-lg bg-[#0A0A1A]/60 p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active ? "true" : "false"}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={
              active
                ? "rounded-md bg-[#E94560] px-3 py-1 text-xs font-semibold text-white transition"
                : "rounded-md px-3 py-1 text-xs font-medium text-gray-400 transition hover:text-white"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
