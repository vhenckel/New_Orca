/**
 * RouteGuard: protege rotas do app.
 *
 * - Redireciona para /login se `requiresAuth` e usuário não autenticado.
 * - Se a rota pertence a um módulo com `allowedPersonas` e a persona do
 *   usuário não está incluída, redireciona para o landing da persona dele.
 *   (evita que buyer abra `/supplier/...` e vice-versa)
 */

import { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getLandingPathForPersona, useAuth } from "@/shared/auth/AuthContext";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import type { AppModuleDefinition, AppRouteDefinition } from "@/app/router/types";

interface RouteGuardProps extends PropsWithChildren {
  route: AppRouteDefinition;
  /** Módulo ao qual a rota pertence (usado para checagem de persona). */
  module?: AppModuleDefinition;
}

export function RouteGuard({ route, module, children }: RouteGuardProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const apiRole = useApiUserRole();
  const isMobile = useIsMobile();
  const location = useLocation();
  const requiresAuth = route.requiresAuth !== false;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Carregando…</span>
      </div>
    );
  }

  if (requiresAuth && !isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: returnTo }}
      />
    );
  }

  if (user && location.pathname.startsWith("/m/") && user.persona === "buyer") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && module?.allowedPersonas && module.allowedPersonas.length > 0) {
    if (!module.allowedPersonas.includes(user.persona)) {
      return (
        <Navigate to={getLandingPathForPersona(user.persona, { isMobile })} replace />
      );
    }
  }

  if (route.allowedApiRoles && route.allowedApiRoles.length > 0) {
    if (!apiRole || !route.allowedApiRoles.includes(apiRole)) {
      return <Navigate to="/404" replace />;
    }
  }

  return <>{children}</>;
}
