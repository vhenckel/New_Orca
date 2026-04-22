/**
 * RouteGuard: redireciona para /login se requiresAuth e não autenticado.
 */

import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/shared/auth/AuthContext";
import type { AppRouteDefinition } from "@/app/router/types";

interface RouteGuardProps extends PropsWithChildren {
  route: AppRouteDefinition;
}

export function RouteGuard({ route, children }: RouteGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const requiresAuth = route.requiresAuth !== false;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Carregando…</span>
      </div>
    );
  }

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
