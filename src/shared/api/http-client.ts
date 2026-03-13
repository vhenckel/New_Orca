/**
 * Cliente HTTP central: injeta Authorization (token store ou env), gatekeeper por companyId, trata 401 com logout.
 */

import {
  getSpotApiHeaders,
  getSpotSkipGatekeeperUrls,
  spotApiBaseUrl,
  spotApiMorpheusUrl,
} from "@/shared/config/env";
import {
  clearStoredToken,
  getStoredToken,
} from "@/shared/auth/token-store";
import { getCompanyIdFromToken } from "@/shared/auth/jwt";
import {
  clearPartitionCache,
  resolveSpotBaseUrl,
} from "@/shared/api/spot-gateway";

let onUnauthorized: (() => void) | null = null;

/** Registra callback chamado em 401 (ex.: logout e redirecionar). Deve ser chamado pelo AuthProvider. */
export function setHttpClientOnUnauthorized(callback: (() => void) | null): void {
  onUnauthorized = callback;
}

/** Headers para API Spot: token da sessão primeiro, fallback para env. */
export function getSpotAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  if (token) return { Authorization: `Bearer ${token}` };
  return getSpotApiHeaders();
}

export interface SpotRequestInit extends RequestInit {
  /** Path relativo à base da API (ex.: "/me", "/contact/query", "/analytics/renegotiation/view/boxes"). */
  path?: string;
  /** Query params; companyId pode ser injetado pelo caller. */
  searchParams?: Record<string, string>;
}

/** Paths que nunca usam gatekeeper (sempre baseUrl). /auth/accounts e /auth/switch-company usam a partição para encontrar o usuário. */
const SKIP_GATEKEEPER_PATHS = ["/admin/partition"];

function shouldSkipGatekeeper(pathOrUrl: string): boolean {
  const path = pathOrUrl.startsWith("http") ? new URL(pathOrUrl).pathname : pathOrUrl.split("?")[0];
  if (SKIP_GATEKEEPER_PATHS.some((p) => path.includes(p))) return true;
  return getSpotSkipGatekeeperUrls().some((s) => path.includes(s));
}

/**
 * Resolve base URL com gatekeeper (partition por companyId).
 * Skip: /admin/partition e VITE_SPOT_SKIP_GATEKEEPER_URLS; quando skip e gatekeeper é morpheus, usa VITE_SPOT_API_MORPHEUS_URL.
 */
async function getResolvedBaseUrl(pathOrUrl: string): Promise<string> {
  const token = getStoredToken();
  const companyId = token ? getCompanyIdFromToken(token) : null;
  const skip = shouldSkipGatekeeper(pathOrUrl);

  const base = await resolveSpotBaseUrl(spotApiBaseUrl, companyId, getSpotAuthHeaders);
  const isMorpheus = base.includes("/morpheus");

  if (skip) {
    if (isMorpheus && spotApiMorpheusUrl) return spotApiMorpheusUrl;
    return spotApiBaseUrl;
  }
  return base;
}

/**
 * Requisição à API Spot. Adiciona Authorization, baseUrl (com gatekeeper quando aplicável) e trata 401.
 * @param pathOrUrl - path relativo (ex.: "/me") ou URL absoluta
 * @param init - fetch init; headers são mesclados com getSpotAuthHeaders()
 */
export async function spotFetch(
  pathOrUrl: string,
  init: RequestInit = {}
): Promise<Response> {
  const baseUrl = await getResolvedBaseUrl(pathOrUrl);
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${baseUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
  const headers = new Headers(getSpotAuthHeaders());
  const existing = new Headers(init.headers);
  existing.forEach((v, k) => headers.set(k, v));
  const res = await fetch(url, { ...init, headers, credentials: "omit" });
  if (res.status === 401) {
    clearStoredToken();
    clearPartitionCache();
    onUnauthorized?.();
    throw new Error("Unauthorized");
  }
  return res;
}

/**
 * spotFetch + parse JSON. Lança se !res.ok (exceto 401 já tratado).
 */
export async function spotJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await spotFetch(path, init);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}
