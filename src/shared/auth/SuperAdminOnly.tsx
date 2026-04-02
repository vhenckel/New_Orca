import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/shared/auth/AuthContext";
import { isSuperAdminUser } from "@/shared/auth/is-super-admin";

interface SuperAdminOnlyProps extends PropsWithChildren {
  /** Path de redirecionamento quando o usuário não for superadmin (default "/"). */
  redirectTo?: string;
}

/**
 * Gating: só renderiza children se `user.email` for o superadmin compartilhado.
 * Exige estar dentro de `AuthProvider` e, em rotas protegidas, após `RouteGuard` (usuário autenticado).
 */
export function SuperAdminOnly({ children, redirectTo = "/" }: SuperAdminOnlyProps) {
  const { user } = useAuth();

  if (!isSuperAdminUser(user)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
