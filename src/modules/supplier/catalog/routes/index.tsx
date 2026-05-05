import { BookOpen } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SupplierCatalogPage } from "@/modules/supplier/catalog/pages/SupplierCatalogPage";

export const supplierCatalogModule: AppModuleDefinition = {
  key: "supplier-catalog",
  basePath: "/supplier/catalog",
  allowedPersonas: ["supplier"],
  titleKey: "modules.supplierPortal.catalog.title",
  descriptionKey: "modules.supplierPortal.catalog.description",
  icon: BookOpen,
  routes: [
    {
      path: "/supplier/catalog",
      labelKey: "modules.supplierPortal.catalog.routes.main.label",
      descriptionKey: "modules.supplierPortal.catalog.routes.main.description",
      icon: BookOpen,
      element: <SupplierCatalogPage />,
    },
  ],
};
