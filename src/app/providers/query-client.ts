import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/shared/api/http-client";
import { captureError } from "@/shared/observability/sentry";
import { isVerboseMode, sanitizeRoute } from "@/shared/observability/sentry-utils";

function getRouteTag(): string {
  return sanitizeRoute(window.location.pathname);
}

function inferFeature(queryKey: unknown): string {
  if (!Array.isArray(queryKey) || queryKey.length === 0) return "unknown";
  return String(queryKey[0]);
}

function extractHttpStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  return undefined;
}

function reportQueryError(
  error: unknown,
  meta: { type: "query" | "mutation"; key: unknown },
): void {
  const status = extractHttpStatus(error);
  if (status === 401) return;

  const isServerError = status === undefined || status >= 500;
  if (!isVerboseMode() && !isServerError) return;

  const err = error instanceof Error ? error : new Error(String(error));

  captureError(err, {
    level: status !== undefined && status < 500 ? "warning" : "error",
    tags: {
      subsystem: "react-query",
      type: meta.type,
      feature: inferFeature(meta.key),
      route: getRouteTag(),
      handled: "true",
      ...(status !== undefined ? { "http.status": String(status) } : {}),
    },
    extra: {
      queryKey: meta.key,
    },
    fingerprint: ["react-query", meta.type, inferFeature(meta.key)],
  });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      reportQueryError(error, { type: "query", key: query.queryKey });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      reportQueryError(error, {
        type: "mutation",
        key: mutation.options.mutationKey,
      });
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});
