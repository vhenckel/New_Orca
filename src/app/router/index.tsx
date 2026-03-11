import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/app/layouts/AppShell";
import { NotFoundPage } from "@/app/router/NotFoundPage";
import { businessModules } from "@/app/router/modules";
import { debtNegotiationModule } from "@/modules/debt-negotiation";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={debtNegotiationModule.basePath} replace />} />
        {businessModules.flatMap((module) =>
          module.routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<AppShell modules={businessModules}>{route.element}</AppShell>}
            />
          )),
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
