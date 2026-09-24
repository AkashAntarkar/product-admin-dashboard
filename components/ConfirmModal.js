"use client";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  isBusy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg text-ink">{title}</h2>
        {message && <p className="mt-2 text-sm text-ink/60">{message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isBusy}
            className="rounded-md bg-rust px-4 py-2 text-sm font-medium text-white transition hover:bg-rust/90 disabled:opacity-50"
          >
            {isBusy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
