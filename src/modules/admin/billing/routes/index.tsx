import { CircleDollarSign } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AdminBillingPage } from "@/modules/admin/billing/pages/AdminBillingPage";

export const adminBillingModule: AppModuleDefinition = {
  key: "admin-billing",
  basePath: "/admin/billing",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.billing.title",
  descriptionKey: "modules.admin.billing.description",
  icon: CircleDollarSign,
  routes: [
    {
      path: "/admin/billing",
      labelKey: "modules.admin.billing.routes.main.label",
      descriptionKey: "modules.admin.billing.routes.main.description",
      icon: CircleDollarSign,
      element: <AdminBillingPage />,
    },
  ],
};
