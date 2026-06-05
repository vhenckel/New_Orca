import { Truck } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AdminSuppliersPage } from "@/modules/admin/suppliers/pages/AdminSuppliersPage";

export const adminSuppliersModule: AppModuleDefinition = {
  key: "admin-suppliers",
  basePath: "/admin/suppliers",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.suppliers.title",
  descriptionKey: "modules.admin.suppliers.description",
  icon: Truck,
  routes: [
    {
      path: "/admin/suppliers",
      labelKey: "modules.admin.suppliers.routes.main.label",
      descriptionKey: "modules.admin.suppliers.routes.main.description",
      icon: Truck,
      element: <AdminSuppliersPage />,
    },
  ],
};
