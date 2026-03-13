/**
 * RouteGuard: redireciona para /login se requiresAuth e não autenticado;
 * opcionalmente exige requiredPermissions (senão redireciona ou mostra forbidden).
 */

import { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/shared/auth/AuthContext";
import { hasPermission } from "@/shared/auth/permissions";
import type { AppRouteDefinition } from "@/app/router/types";

interface RouteGuardProps extends PropsWithChildren {
  route: AppRouteDefinition;
}

export function RouteGuard({ route, children }: RouteGuardProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const requiresAuth = route.requiresAuth !== false;
  const requiredPermissions = route.requiredPermissions;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Carregando…</span>
      </div>
    );
  }

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requiredPermissions?.length &&
    user?.profile &&
    !hasPermission(user.profile, requiredPermissions)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Sem permissão para acessar esta página.</p>
      </div>
    );
  }

  return <>{children}</>;
}
