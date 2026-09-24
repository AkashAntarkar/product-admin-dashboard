export default function EmptyState({
  title = "Nothing here",
  message = "Try adjusting your search or filters.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink/60">{message}</p>
      {action}
    </div>
  );
}
