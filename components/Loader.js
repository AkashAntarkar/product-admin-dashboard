export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/60">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-brand-600"
        role="status"
        aria-label={label}
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
