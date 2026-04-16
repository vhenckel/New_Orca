import type { MeResponse } from "@/shared/auth/types";

/** Conta compartilhada de Super Admin no ORCA (acesso multi-empresa). */
export const SUPERADMIN_EMAIL = "superadmin@orca.app";

/**
 * Indica se o usuário atual é o Super Admin identificado por email no `/me`.
 * Fonte única reutilizada por theming, gating de rotas e menu.
 */
export function isSuperAdminUser(user: MeResponse | null | undefined): boolean {
  if (!user) return false;
  const email = user.email?.trim().toLowerCase();
  return email === SUPERADMIN_EMAIL;
}
