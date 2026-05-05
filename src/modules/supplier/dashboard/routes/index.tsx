import { LayoutDashboard } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SupplierDashboardPage } from "@/modules/supplier/dashboard/pages/SupplierDashboardPage";

export const supplierDashboardModule: AppModuleDefinition = {
  key: "supplier-dashboard",
  basePath: "/supplier/dashboard",
  allowedPersonas: ["supplier"],
  titleKey: "modules.supplierPortal.dashboard.title",
  descriptionKey: "modules.supplierPortal.dashboard.description",
  icon: LayoutDashboard,
  routes: [
    {
      path: "/supplier/dashboard",
      labelKey: "modules.supplierPortal.dashboard.routes.main.label",
      descriptionKey: "modules.supplierPortal.dashboard.routes.main.description",
      icon: LayoutDashboard,
      element: <SupplierDashboardPage />,
    },
  ],
};
