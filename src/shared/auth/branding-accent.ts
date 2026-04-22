import type { MeResponse } from "@/shared/auth/types";
import {
  accentColorStorageKey,
  applyAccentColor,
  defaultAccentColor,
  sanitizeAccentColor,
} from "@/shared/theme/accent-color";

function getStoredUserAccentColor(): string | null {
  try {
    const raw = window.localStorage.getItem(accentColorStorageKey);
    if (!raw) return null;
    return sanitizeAccentColor(raw);
  } catch {
    return null;
  }
}

/**
 * Resolve e aplica a cor primária (shadcn/Tailwind CSS vars):
 * preferência do usuário tem precedência; depois branding da empresa; por fim default.
 */
export function applyResolvedAccentColor(me: MeResponse | null): void {
  const userAccent = getStoredUserAccentColor();
  const companyAccent = me?.branding?.color ? sanitizeAccentColor(me.branding.color) : null;
  const resolved = userAccent ?? companyAccent ?? defaultAccentColor;

  applyAccentColor(resolved);
}

