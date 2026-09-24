"use client";

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating-asc", label: "Rating: low to high" },
  { value: "rating-desc", label: "Rating: high to low" },
  { value: "title-asc", label: "Title: A to Z" },
  { value: "title-desc", label: "Title: Z to A" },
];

export default function FilterSortBar({
  categories,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categoryDisabled,
  categoryDisabledHint,
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        disabled={categoryDisabled}
        title={categoryDisabled ? categoryDisabledHint : undefined}
        aria-label="Filter by category"
        className="rounded-md border border-line bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink/40"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort products"
        className="rounded-md border border-line bg-white px-3 py-2 text-sm"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
