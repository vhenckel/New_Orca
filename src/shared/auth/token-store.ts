/**
 * Storage de token e usuário: memória + localStorage.
 * Fonte única para Authorization; fallback para env fica em getApiHeaders quando token vazio.
 */

import type { ApiUser } from "@/shared/auth/types";

const STORAGE_KEY = "orca_access_token";
const USER_STORAGE_KEY = "orca_auth_user";

let memoryToken: string | null = null;
let memoryUser: ApiUser | null = null;

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

export function getStoredUser(): ApiUser | null {
  if (memoryUser) return memoryUser;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    memoryUser = JSON.parse(raw) as ApiUser;
    return memoryUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: ApiUser): void {
  memoryUser = user;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearStoredSession(): void {
  memoryToken = null;
  memoryUser = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** @deprecated Preferir clearStoredSession */
export function clearStoredToken(): void {
  clearStoredSession();
}
