/**
 * Decode JWT payload (client-side only, no verification; backend validates).
 */

import type { TokenClaims } from "./types";

export function decodeTokenPayload(accessToken: string): TokenClaims | null {
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;
    const raw = atob(parts[1]);
    return JSON.parse(raw) as TokenClaims;
  } catch {
    return null;
  }
}

/** Extrai companyId do token (cmpid claim). */
export function getCompanyIdFromToken(accessToken: string): number | null {
  const payload = decodeTokenPayload(accessToken);
  const id = payload?.cmpid;
  if (id === undefined || id === null) return null;
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}
