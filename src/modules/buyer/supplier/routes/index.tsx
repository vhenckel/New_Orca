import { Store } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SupplierDetailPage } from "@/modules/buyer/supplier/pages/SupplierDetailPage";
import { SuppliersPage } from "@/modules/buyer/supplier/pages/SuppliersPage";

export const supplierModule: AppModuleDefinition = {
  key: "supplier",
  basePath: "/suppliers",
  allowedPersonas: ["buyer"],
  titleKey: "modules.supplier.title",
  descriptionKey: "modules.supplier.description",
  icon: Store,
  routes: [
    {
      path: "/suppliers",
      labelKey: "modules.supplier.routes.main.label",
      descriptionKey: "modules.supplier.routes.main.description",
      icon: Store,
      element: <SuppliersPage />,
    },
    {
      path: "/suppliers/:id",
      labelKey: "modules.supplier.routes.detail.label",
      descriptionKey: "modules.supplier.routes.detail.description",
      icon: Store,
      element: <SupplierDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.supplier.routes.main.label",
        path: "/suppliers",
      },
    },
  ],
};
