import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { matchPath, useLocation } from "react-router-dom";

import { AuthProvider } from "@/shared/auth/AuthContext";
import { RouteGuard } from "@/shared/auth/RouteGuard";
import { useI18n } from "@/shared/i18n/useI18n";
import { ChooseCompanyPage } from "@/app/pages/ChooseCompanyPage";
import { ForgotPasswordPage } from "@/app/pages/ForgotPasswordPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { AppShell } from "@/app/layouts/AppShell";
import { NotFoundPage } from "@/app/router/NotFoundPage";
import { businessModules } from "@/app/router/modules";
import { debtNegotiationModule } from "@/modules/debt-negotiation";

const APP_NAME = "O2OSpot";

function DocumentTitleSync() {
  const location = useLocation();
  const { t } = useI18n();

  const routeLabel = useMemo(() => {
    const allRoutes = businessModules.flatMap((module) => module.routes);
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

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NuqsAdapter>
          <DocumentTitleSync />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/choose-company" element={<ChooseCompanyPage />} />
            <Route path="/" element={<Navigate to={debtNegotiationModule.basePath} replace />} />
            {businessModules.flatMap((module) =>
              module.routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RouteGuard route={route}>
                      <AppShell modules={businessModules}>{route.element}</AppShell>
                    </RouteGuard>
                  }
                />
              )),
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NuqsAdapter>
      </AuthProvider>
    </BrowserRouter>
  );
}
