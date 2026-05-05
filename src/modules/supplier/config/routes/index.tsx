import { Settings2 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { PreferencesPage } from "@/modules/buyer/config/pages/PreferencesPage";

export const supplierConfigModule: AppModuleDefinition = {
  key: "supplier-config",
  basePath: "/supplier/config",
  allowedPersonas: ["supplier"],
  titleKey: "modules.supplierPortal.config.title",
  descriptionKey: "modules.supplierPortal.config.description",
  icon: Settings2,
  routes: [
    {
      path: "/supplier/config",
      labelKey: "modules.supplierPortal.config.routes.main.label",
      descriptionKey: "modules.supplierPortal.config.routes.main.description",
      icon: Settings2,
      element: <PreferencesPage />,
    },
  ],
};
