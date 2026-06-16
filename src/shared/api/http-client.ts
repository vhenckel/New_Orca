import { apiBaseUrl } from "@/shared/config/env";
import { getStoredToken } from "@/shared/auth/token-store";
import { captureHttpError, Sentry } from "@/shared/observability/sentry";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let handlingUnauthorized = false;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // ignore
  }
  if (response.status === 401) {
    return "Usuário ou senha inválido";
  }
  return `Erro na requisição (${response.status})`;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Quando true, não envia Authorization e não dispara handler de 401 global. */
  skipAuth?: boolean;
}

function resolveRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

function applySentryTraceHeaders(headers: Headers): void {
  const traceData = Sentry.getTraceData();
  if (traceData["sentry-trace"]) {
    headers.set("sentry-trace", traceData["sentry-trace"]);
  }
  if (traceData.baggage) {
    headers.set("baggage", traceData.baggage);
  }
}

function reportHttpFailure(
  error: ApiError,
  context: { url: string; method: string; responseMessage: string },
): void {
  captureHttpError(error, {
    url: context.url,
    method: context.method,
    status: error.status,
    responseMessage: context.responseMessage,
    subsystem: "http",
  });
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  applySentryTraceHeaders(headers);

  const requestUrl = `${apiBaseUrl}${path}`;
  const method = (rest.method ?? "GET").toUpperCase();

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      ...rest,
      headers,
      body: resolveRequestBody(body),
    });
  } catch (networkError) {
    const err =
      networkError instanceof Error
        ? networkError
        : new Error("Falha de rede na requisição");
    captureHttpError(err, {
      url: path,
      method,
      subsystem: "http",
    });
    throw err;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    let parsedBody: unknown;
    try {
      parsedBody = await response.clone().json();
    } catch {
      parsedBody = undefined;
    }

    if (response.status === 401 && !skipAuth && unauthorizedHandler && !handlingUnauthorized) {
      handlingUnauthorized = true;
      try {
        unauthorizedHandler();
      } finally {
        handlingUnauthorized = false;
      }
    }

    const apiError = new ApiError(message, response.status, parsedBody);
    reportHttpFailure(apiError, {
      url: path,
      method,
      responseMessage: message,
    });
    throw apiError;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.blob()) as T;
  }

  return (await response.json()) as T;
}

/** GET que retorna Blob (ex.: download de template CSV). */
export async function apiRequestBlob(
  path: string,
  options: Omit<ApiRequestOptions, "body"> = {},
): Promise<Blob> {
  const { skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  applySentryTraceHeaders(headers);

  const method = (rest.method ?? "GET").toUpperCase();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...rest,
      headers,
    });
  } catch (networkError) {
    const err =
      networkError instanceof Error
        ? networkError
        : new Error("Falha de rede na requisição");
    captureHttpError(err, {
      url: path,
      method,
      subsystem: "http",
    });
    throw err;
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const apiError = new ApiError(message, response.status);
    reportHttpFailure(apiError, {
      url: path,
      method,
      responseMessage: message,
    });
    throw apiError;
  }

  return response.blob();
}
