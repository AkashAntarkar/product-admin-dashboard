"use client";

const PAGE_SIZES = [10, 20, 50];

// Builds a compact list of page numbers with "..." gaps, e.g.
// [1, "...", 4, 5, 6, "...", 20] instead of every page 1-20.
function buildPageList(current, total) {
  const pages = [];
  const window = 1;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= window) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pageList = buildPageList(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink/60">
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total}`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink/60">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-line bg-white px-2 py-1 text-sm"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-line px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {pageList.map((p, i) =>
            p === "..." ? (
              <span key={`gap-${i}`} className="px-2 text-sm text-ink/40">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`h-8 min-w-[2rem] rounded-md px-2 text-sm ${
                  p === page
                    ? "bg-brand-600 text-white"
                    : "border border-line text-ink hover:bg-white"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-md border border-line px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
}
