import {
  getVisibilityMode,
  httpLevel,
  isVerboseMode,
  sanitizeRoute,
  sanitizeSentryData,
  shouldReportAuthWarning,
  shouldReportError,
  shouldReportHttpStatus,
} from "@/shared/observability/sentry-utils";
import type { MeResponse } from "@/shared/auth/types";
import * as Sentry from "@sentry/react";
import type { ErrorEvent, SeverityLevel } from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const isDeployMode = ["staging", "production"].includes(import.meta.env.MODE);
const forceEnabled =
  import.meta.env.VITE_SENTRY_ENABLED?.toLowerCase() === "true";
const enabled = Boolean(dsn && (isDeployMode || forceEnabled));

function sanitizeWebEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.url) {
    event.request.url = sanitizeUrl(event.request.url);
  }

  event.tags = {
    ...event.tags,
    visibility_mode: getVisibilityMode(),
  };

  if (event.extra) {
    event.extra = sanitizeSentryData(event.extra);
  }
  if (event.contexts) {
    event.contexts = sanitizeSentryData(event.contexts);
  }

  return event;
}

if (enabled) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      ...(isVerboseMode()
        ? [Sentry.captureConsoleIntegration({ levels: ["warn", "error"] })]
        : []),
    ],
    tracesSampleRate:
      import.meta.env.MODE === "production" && !isVerboseMode() ? 0.5 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: isVerboseMode() ? 0.1 : 0,
    beforeSend(event: ErrorEvent) {
      return sanitizeWebEvent(event);
    },
  });
}

export function isSentryEnabled(): boolean {
  return enabled;
}

export function setSentryUser(user: Pick<MeResponse, "id" | "name" | "email" | "persona">): void {
  if (!isSentryEnabled()) return;

  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: user.name,
  });
  Sentry.setTag("role", user.persona);
}

export function clearSentryUser(): void {
  if (!isSentryEnabled()) return;

  Sentry.setUser(null);
  Sentry.setTag("role", undefined);
}

export function setSentryRoute(pathname: string): void {
  if (!isSentryEnabled()) return;

  Sentry.setTag("route", sanitizeRoute(pathname));
}

export interface CaptureOptions {
  level?: SeverityLevel;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  fingerprint?: string[];
}

function applyCaptureOptions(
  scope: Sentry.Scope,
  options?: CaptureOptions,
): void {
  if (options?.tags) {
    Object.entries(options.tags).forEach(([key, value]) =>
      scope.setTag(key, value),
    );
  }
  if (options?.extra) {
    scope.setExtras(options.extra);
  }
  if (options?.level) {
    scope.setLevel(options.level);
  }
  if (options?.fingerprint) {
    scope.setFingerprint(options.fingerprint);
  }
}

export function captureError(error: Error, options?: CaptureOptions): void {
  if (!isSentryEnabled() || !shouldReportError(error)) return;

  Sentry.withScope((scope) => {
    applyCaptureOptions(scope, options);
    Sentry.captureException(error);
  });
}

/**
 * Captura uma mensagem de aviso no Sentry.
 * Por padrão só dispara quando o Sentry está habilitado E em modo verbose,
 * evitando poluir o dashboard com warnings em produção normal.
 */
export function captureVerboseWarning(
  message: string,
  options?: CaptureOptions,
): void {
  if (!isSentryEnabled() || !isVerboseMode()) return;

  Sentry.withScope((scope) => {
    applyCaptureOptions(scope, {
      ...options,
      level: options?.level ?? "warning",
    });
    Sentry.captureMessage(message, options?.level ?? "warning");
  });
}

/** @deprecated Use captureVerboseWarning, que reflete o comportamento real. */
export function captureWarning(
  message: string,
  options?: CaptureOptions,
): void {
  captureVerboseWarning(message, options);
}

export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
): void {
  if (!isSentryEnabled()) return;

  Sentry.addBreadcrumb({ message, data });
}

export function captureHttpError(
  error: Error,
  context: {
    url?: string;
    method?: string;
    status?: number;
    responseMessage?: unknown;
    subsystem?: string;
  },
): void {
  if (!shouldReportHttpStatus(context.status)) return;

  const status = context.status;
  const isAuthError = status === 401 || status === 403;

  if (isAuthError && !shouldReportAuthWarning(`http-${status}`)) return;

  captureError(error, {
    level: httpLevel(status),
    tags: {
      subsystem: context.subsystem ?? "http",
      handled: "true",
      ...(status !== undefined ? { "http.status": String(status) } : {}),
      ...(status !== undefined && status < 500
        ? { error_type: "http.client_error" }
        : {}),
    },
    extra: {
      url: context.url,
      method: context.method,
      responseMessage: context.responseMessage,
      visibility_mode: getVisibilityMode(),
    },
    fingerprint: status
      ? ["http", String(status), context.url ?? "unknown"]
      : ["http", "network", context.url ?? "unknown"],
  });
}

export { Sentry };
