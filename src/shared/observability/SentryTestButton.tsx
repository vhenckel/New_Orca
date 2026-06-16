import {
  captureError,
  isSentryEnabled,
} from "@/shared/observability/sentry";

export function SentryTestButton() {
  if (!isSentryEnabled()) return null;

  return (
    <button
      type="button"
      className="fixed bottom-4 left-4 z-50 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700"
      onClick={() => captureError(new Error("This is your first error!"))}
    >
      Testar Sentry
    </button>
  );
}
