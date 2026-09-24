"use client";

export default function SearchBar({ value, onChange, disabled, disabledHint }) {
  return (
    <div className="flex-1 min-w-[200px]">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? disabledHint : "Search products..."}
        aria-label="Search products"
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink/40"
      />
    </div>
  );
}
