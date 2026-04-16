/**
 * Storage de token: memória + localStorage.
 * Fonte única para Authorization; fallback para env fica em getSpotApiHeaders quando token vazio.
 */

const STORAGE_KEY = "orca_access_token";

let memoryToken: string | null = null;

export function getStoredToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) memoryToken = v;
    return memoryToken;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  memoryToken = token;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

export function clearStoredToken(): void {
  memoryToken = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
