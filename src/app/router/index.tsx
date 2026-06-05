import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { matchPath, useLocation } from "react-router-dom";

import { AuthProvider, getLandingPathForPersona, useAuth } from "@/shared/auth/AuthContext";
import { RouteGuard } from "@/shared/auth/RouteGuard";
import { useI18n } from "@/shared/i18n/useI18n";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { ForgotPasswordPage } from "@/app/pages/ForgotPasswordPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { LogoutPage } from "@/app/pages/LogoutPage";
import { ResetPasswordPage } from "@/app/pages/ResetPasswordPage";
import { NotFoundPage } from "@/app/router/NotFoundPage";
import { MobileRedirectGuard } from "@/app/router/MobileRedirectGuard";
import { ModuleShell } from "@/app/router/ModuleShell";
import {
  adminModules,
  buyerModules,
  sharedModules,
  supplierMobileModules,
  supplierModules,
} from "@/app/router/modules";

const APP_NAME = "Orca";

/** União de todos os módulos conhecidos — registra todas as rotas no router. */
const allModules = [
  ...buyerModules,
  ...supplierModules,
  ...supplierMobileModules,
  ...adminModules.filter((module) => !buyerModules.some((m) => m.key === module.key)),
  ...sharedModules,
];

function DocumentTitleSync() {
  const location = useLocation();
  const { t } = useI18n();

  const routeLabel = useMemo(() => {
    const allRoutes = allModules.flatMap((module) => module.routes);
    const matchedRoute = allRoutes.find((route) =>
      matchPath({ path: route.path, end: true }, location.pathname),
    );
    return matchedRoute ? t(matchedRoute.labelKey) : null;
  }, [location.pathname, t]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = routeLabel ? `${APP_NAME} - ${routeLabel}` : APP_NAME;
  }, [routeLabel]);

  return null;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Carregando…</span>
      </div>
    );
  }

  const to = user ? getLandingPathForPersona(user.persona, { isMobile }) : "/login";
  return <Navigate to={to} replace />;
}

function PersonaAppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password" element={<Navigate to="/esqueci-minha-senha" replace />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/config" element={<Navigate to="/preferences" replace />} />
      <Route path="/supplier/config" element={<Navigate to="/preferences" replace />} />
      {allModules.flatMap((module) =>
        module.routes.map((route) => (
          <Route
            key={`${module.key}-${route.path}`}
            path={route.path}
            element={
              <RouteGuard route={route} module={module}>
                <ModuleShell module={module}>{route.element}</ModuleShell>
              </RouteGuard>
            }
          />
        )),
      )}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NuqsAdapter>
          <DocumentTitleSync />
          <MobileRedirectGuard />
          <PersonaAppRoutes />
        </NuqsAdapter>
      </AuthProvider>
    </BrowserRouter>
  );
}
