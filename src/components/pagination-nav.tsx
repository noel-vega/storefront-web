import Link from "next/link";

export function PaginationNav({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-4 text-sm">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="underline">
          Previous
        </Link>
      ) : (
        <span className="text-black/30 dark:text-white/30">Previous</span>
      )}
      <span className="text-black/60 dark:text-white/60">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="underline">
          Next
        </Link>
      ) : (
        <span className="text-black/30 dark:text-white/30">Next</span>
      )}
    </nav>
  );
}
