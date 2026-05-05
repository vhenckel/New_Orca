import { Settings2 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { PreferencesPage } from "@/modules/buyer/config/pages/PreferencesPage";

export const configModule: AppModuleDefinition = {
  key: "config",
  basePath: "/config",
  allowedPersonas: ["buyer"],
  titleKey: "modules.config.title",
  descriptionKey: "modules.config.description",
  icon: Settings2,
  hideInSidebar: true,
  routes: [
    {
      path: "/config",
      labelKey: "modules.config.routes.preferences.label",
      descriptionKey: "modules.config.routes.preferences.description",
      icon: Settings2,
      element: <PreferencesPage />,
    },
  ],
};
