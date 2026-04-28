import Link from "next/link";

interface Props {
  message: string;
  clearHref: string;
}

export default function SpokeEmptyNoMatches({ message, clearHref }: Props) {
  return (
    <div
      data-testid="spoke-empty-no-matches"
      className="mt-10 flex flex-col items-start gap-3 rounded-xl border border-white/[0.06] bg-[#13202D] p-6"
    >
      <p className="text-sm text-gray-300">{message}</p>
      <Link
        href={clearHref}
        className="text-sm text-[#E94560] hover:underline"
      >
        Clear filters
      </Link>
    </div>
  );
}
