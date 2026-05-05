import { Users2 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SupplierCustomersPage } from "@/modules/supplier/customers/pages/SupplierCustomersPage";

export const supplierCustomersModule: AppModuleDefinition = {
  key: "supplier-customers",
  basePath: "/supplier/customers",
  allowedPersonas: ["supplier"],
  titleKey: "modules.supplierPortal.customers.title",
  descriptionKey: "modules.supplierPortal.customers.description",
  icon: Users2,
  routes: [
    {
      path: "/supplier/customers",
      labelKey: "modules.supplierPortal.customers.routes.main.label",
      descriptionKey: "modules.supplierPortal.customers.routes.main.description",
      icon: Users2,
      element: <SupplierCustomersPage />,
    },
  ],
};
