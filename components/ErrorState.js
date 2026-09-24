export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-rust/30 bg-rust/5 px-6 py-16 text-center">
      <p className="font-display text-lg text-rust">Couldn't load this</p>
      <p className="max-w-sm text-sm text-ink/70">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-md bg-rust px-4 py-2 text-sm font-medium text-white transition hover:bg-rust/90"
        >
          Retry
        </button>
      )}
    </div>
  );
}
