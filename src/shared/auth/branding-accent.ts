import type { MeResponse } from "@/shared/auth/types";
import { isSuperAdminUser } from "@/shared/auth/is-super-admin";
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
 * Resolve e aplica a cor primária (shadcn/Tailwind CSS vars) considerando:
 * - SuperAdmin (email fixo): cor da empresa tem precedência; senão cai na do usuário.
 * - Usuário normal: preferência do usuário tem precedência; senão cai na da empresa.
 */
export function applyResolvedAccentColor(me: MeResponse | null): void {
  const userAccent = getStoredUserAccentColor();
  const companyAccent = me?.branding?.color ? sanitizeAccentColor(me.branding.color) : null;
  const isSuperAdmin = isSuperAdminUser(me);

  const resolved =
    isSuperAdmin
      ? (companyAccent ?? userAccent ?? defaultAccentColor)
      : (userAccent ?? companyAccent ?? defaultAccentColor);

  applyAccentColor(resolved);
}

