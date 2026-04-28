import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export default function SpokePagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const baseBtn =
    "inline-flex items-center rounded-lg border border-white/[0.06] bg-[#13202D] px-3 py-1.5 text-sm transition";
  const enabledBtn = `${baseBtn} text-white hover:border-white/[0.12]`;
  const disabledBtn = `${baseBtn} text-gray-600 cursor-not-allowed`;

  return (
    <nav
      aria-label="Pagination"
      data-testid="spoke-pagination"
      className="mt-6 flex items-center justify-between"
    >
      <div className="text-xs text-gray-500">
        Page{" "}
        <span className="font-mono tabular-nums text-gray-300">{page}</span>{" "}
        of{" "}
        <span className="font-mono tabular-nums text-gray-300">
          {totalPages}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span aria-disabled="true" className={disabledBtn}>
            &larr; Previous
          </span>
        ) : (
          <Link
            href={buildHref(page - 1)}
            className={enabledBtn}
            rel="prev"
          >
            &larr; Previous
          </Link>
        )}
        {nextDisabled ? (
          <span aria-disabled="true" className={disabledBtn}>
            Next &rarr;
          </span>
        ) : (
          <Link
            href={buildHref(page + 1)}
            className={enabledBtn}
            rel="next"
          >
            Next &rarr;
          </Link>
        )}
      </div>
    </nav>
  );
}
