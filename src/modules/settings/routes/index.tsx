import { Settings2 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { PreferencesPage } from "@/modules/settings/pages/PreferencesPage";

export const settingsModule: AppModuleDefinition = {
  key: "settings",
  basePath: "/settings",
  titleKey: "modules.settings.title",
  descriptionKey: "modules.settings.description",
  icon: Settings2,
  routes: [
    {
      path: "/settings",
      labelKey: "modules.settings.routes.preferences.label",
      descriptionKey: "modules.settings.routes.preferences.description",
      icon: Settings2,
      element: <PreferencesPage />,
    },
  ],
};
