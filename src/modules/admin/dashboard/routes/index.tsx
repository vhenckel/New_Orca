import { LayoutDashboard } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AdminDashboardPage } from "@/modules/admin/dashboard/pages/AdminDashboardPage";

export const adminDashboardModule: AppModuleDefinition = {
  key: "admin-dashboard",
  basePath: "/admin/dashboard",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.dashboard.title",
  descriptionKey: "modules.admin.dashboard.description",
  icon: LayoutDashboard,
  routes: [
    {
      path: "/admin/dashboard",
      labelKey: "modules.admin.dashboard.routes.main.label",
      descriptionKey: "modules.admin.dashboard.routes.main.description",
      icon: LayoutDashboard,
      element: <AdminDashboardPage />,
    },
  ],
};
