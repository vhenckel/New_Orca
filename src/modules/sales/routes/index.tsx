import { LayoutDashboard, ShoppingCart, Users } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { ContactsPage } from "@/modules/sales/pages/ContactsPage";
import { DashboardPage } from "@/modules/sales/pages/DashboardPage";
import { PipelinePage } from "@/modules/sales/pages/PipelinePage";

export const salesModule: AppModuleDefinition = {
  key: "sales",
  basePath: "/sales",
  titleKey: "modules.sales.title",
  descriptionKey: "modules.sales.description",
  icon: ShoppingCart,
  hideInSidebar: true,
  routes: [
    {
      path: "/sales",
      labelKey: "modules.sales.routes.dashboard.label",
      descriptionKey: "modules.sales.routes.dashboard.description",
      icon: LayoutDashboard,
      element: <DashboardPage />,
    },
    {
      path: "/sales/contacts",
      labelKey: "modules.sales.routes.contacts.label",
      descriptionKey: "modules.sales.routes.contacts.description",
      icon: Users,
      element: <ContactsPage />,
      topBarParent: {
        labelKey: "modules.sales.routes.dashboard.label",
        path: "/sales",
      },
    },
    {
      path: "/sales/pipeline",
      labelKey: "modules.sales.routes.pipeline.label",
      descriptionKey: "modules.sales.routes.pipeline.description",
      icon: ShoppingCart,
      element: <PipelinePage />,
      topBarParent: {
        labelKey: "modules.sales.routes.dashboard.label",
        path: "/sales",
      },
    },
  ],
};
