import { Truck } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SupplierFormPage } from "@/modules/suppliers/pages/SupplierFormPage";
import { SuppliersPage } from "@/modules/suppliers/pages/SuppliersPage";

export const suppliersModule: AppModuleDefinition = {
  key: "suppliers",
  basePath: "/suppliers",
  allowedPersonas: ["buyer", "admin"],
  titleKey: "modules.suppliers.title",
  descriptionKey: "modules.suppliers.description",
  icon: Truck,
  routes: [
    {
      path: "/suppliers",
      labelKey: "modules.suppliers.routes.main.label",
      descriptionKey: "modules.suppliers.routes.main.description",
      icon: Truck,
      element: <SuppliersPage />,
      allowedApiRoles: ["admin", "establishment"],
    },
    {
      path: "/suppliers/create",
      labelKey: "modules.suppliers.routes.create.label",
      descriptionKey: "modules.suppliers.routes.create.description",
      icon: Truck,
      element: <SupplierFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.suppliers.routes.main.label",
        path: "/suppliers",
      },
    },
    {
      path: "/suppliers/:id/edit",
      labelKey: "modules.suppliers.routes.edit.label",
      descriptionKey: "modules.suppliers.routes.edit.description",
      icon: Truck,
      element: <SupplierFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.suppliers.routes.main.label",
        path: "/suppliers",
      },
    },
    {
      path: "/suppliers/:id",
      labelKey: "modules.suppliers.routes.detail.label",
      descriptionKey: "modules.suppliers.routes.detail.description",
      icon: Truck,
      element: <SupplierFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin", "establishment"],
      topBarParent: {
        labelKey: "modules.suppliers.routes.main.label",
        path: "/suppliers",
      },
    },
  ],
};
