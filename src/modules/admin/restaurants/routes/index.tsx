import { Store } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AdminRestaurantsPage } from "@/modules/admin/restaurants/pages/AdminRestaurantsPage";

export const adminRestaurantsModule: AppModuleDefinition = {
  key: "admin-restaurants",
  basePath: "/admin/restaurants",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.restaurants.title",
  descriptionKey: "modules.admin.restaurants.description",
  icon: Store,
  routes: [
    {
      path: "/admin/restaurants",
      labelKey: "modules.admin.restaurants.routes.main.label",
      descriptionKey: "modules.admin.restaurants.routes.main.description",
      icon: Store,
      element: <AdminRestaurantsPage />,
    },
  ],
};
