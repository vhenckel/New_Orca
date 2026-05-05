import { BarChart3 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AnalyticsPage } from "@/modules/buyer/analytic/pages/AnalyticsPage";

export const analyticModule: AppModuleDefinition = {
  key: "analytic",
  basePath: "/analytics",
  allowedPersonas: ["buyer"],
  titleKey: "modules.analytic.title",
  descriptionKey: "modules.analytic.description",
  icon: BarChart3,
  routes: [
    {
      path: "/analytics",
      labelKey: "modules.analytic.routes.main.label",
      descriptionKey: "modules.analytic.routes.main.description",
      icon: BarChart3,
      element: <AnalyticsPage />,
    },
  ],
};
