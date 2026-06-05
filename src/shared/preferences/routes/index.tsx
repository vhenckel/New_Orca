import { Settings2 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { PreferencesPage } from "@/shared/preferences/pages/PreferencesPage";

export const preferencesModule: AppModuleDefinition = {
  key: "preferences",
  basePath: "/preferences",
  hideInSidebar: true,
  titleKey: "app.preferences.title",
  descriptionKey: "app.preferences.description",
  icon: Settings2,
  routes: [
    {
      path: "/preferences",
      labelKey: "app.preferences.title",
      descriptionKey: "app.preferences.description",
      icon: Settings2,
      element: <PreferencesPage />,
    },
  ],
};
