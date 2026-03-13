/**
 * PermissionGuard: renderiza children apenas se o usuário tem alguma das permissões (enabled).
 */

import type { PropsWithChildren } from "react";

import { useAuth } from "@/shared/auth/AuthContext";
import { hasPermission } from "@/shared/auth/permissions";

interface PermissionGuardProps extends PropsWithChildren {
  /** Nomes de permissão (qualquer uma habilitada). */
  permissionNames: string[];
  /** Opcional: restringe ao módulo. */
  moduleName?: string;
  /** Opcional: restringe ao submódulo. */
  subModuleName?: string;
}

export function PermissionGuard({
  permissionNames,
  moduleName,
  subModuleName,
  children,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const profile = user?.profile ?? null;
  const allowed = hasPermission(
    profile,
    permissionNames,
    moduleName,
    subModuleName
  );
  if (!allowed) return null;
  return <>{children}</>;
}
