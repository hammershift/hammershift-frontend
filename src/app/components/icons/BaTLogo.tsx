// Bring a Trailer wordmark placeholder — replace with actual SVG from bat.com brand assets
export default function BaTLogo({ className }: { className?: string }) {
  return (
    <span
      className={`font-mono text-xs font-bold text-orange-400 tracking-widest uppercase ${className ?? ''}`}
    >
      BaT
    </span>
  );
}
