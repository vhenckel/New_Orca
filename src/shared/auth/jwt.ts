/**
 * Decode JWT payload (client-side only, no verification; backend validates).
 */

import type { TokenClaims } from "./types";

function safeBase64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

export function decodeTokenPayload(accessToken: string): TokenClaims | null {
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;
    const raw = safeBase64UrlDecode(parts[1]);
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

/** Extrai companyName do token (companyName claim; spot-api usa camelCase). */
export function getCompanyNameFromToken(accessToken: string): string | null {
  const payload = decodeTokenPayload(accessToken);
  const name = payload?.companyName;
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length ? trimmed : null;
}
