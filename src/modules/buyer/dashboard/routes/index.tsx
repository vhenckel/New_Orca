import { LayoutDashboard } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { DashboardPage } from "@/modules/buyer/dashboard/pages/DashboardPage";

export const dashboardModule: AppModuleDefinition = {
  key: "dashboard",
  basePath: "/dashboard",
  allowedPersonas: ["buyer"],
  titleKey: "modules.dashboard.title",
  descriptionKey: "modules.dashboard.description",
  icon: LayoutDashboard,
  routes: [
    {
      path: "/dashboard",
      labelKey: "modules.dashboard.routes.main.label",
      descriptionKey: "modules.dashboard.routes.main.description",
      icon: LayoutDashboard,
      element: <DashboardPage />,
    },
  ],
};
