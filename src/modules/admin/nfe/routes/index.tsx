import { FileText } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AdminNfePage } from "@/modules/admin/nfe/pages/AdminNfePage";

export const adminNfeModule: AppModuleDefinition = {
  key: "admin-nfe",
  basePath: "/nfe",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.nfe.title",
  descriptionKey: "modules.admin.nfe.description",
  icon: FileText,
  routes: [
    {
      path: "/nfe",
      labelKey: "modules.admin.nfe.routes.main.label",
      descriptionKey: "modules.admin.nfe.routes.main.description",
      icon: FileText,
      element: <AdminNfePage />,
      allowedApiRoles: ["admin"],
    },
  ],
};
