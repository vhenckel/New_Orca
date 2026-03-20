import type { MeResponse } from "@/shared/auth/types";

/** Nome da role no sistema legado (management `hasRoles({ roles: ['Super Admin'] })`). */
export const SUPER_ADMIN_ROLE_NAME = "Super Admin";

/**
 * Indica se o usuário atual é Super Admin (gerenciar status de dívida, etc.).
 * Usa `features` do /me e fallback em `profile.name`, como no front legado.
 */
export function isSuperAdminUser(user: MeResponse | null | undefined): boolean {
  if (!user) return false;
  if (user.features?.some((f) => f.name === SUPER_ADMIN_ROLE_NAME)) return true;
  const profileName = user.profile?.name?.trim();
  if (profileName === SUPER_ADMIN_ROLE_NAME) return true;
  return false;
}
