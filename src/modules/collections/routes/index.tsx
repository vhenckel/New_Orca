import { LayoutDashboard, Receipt, Users } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { ChargesPage } from "@/modules/collections/pages/ChargesPage";
import { ContactsPage } from "@/modules/collections/pages/ContactsPage";
import { DashboardPage } from "@/modules/collections/pages/DashboardPage";

export const collectionsModule: AppModuleDefinition = {
  key: "collections",
  basePath: "/collections",
  titleKey: "modules.collections.title",
  descriptionKey: "modules.collections.description",
  icon: Receipt,
  hideInSidebar: true,
  routes: [
    {
      path: "/collections",
      labelKey: "modules.collections.routes.dashboard.label",
      descriptionKey: "modules.collections.routes.dashboard.description",
      icon: LayoutDashboard,
      element: <DashboardPage />,
    },
    {
      path: "/collections/contacts",
      labelKey: "modules.collections.routes.contacts.label",
      descriptionKey: "modules.collections.routes.contacts.description",
      icon: Users,
      element: <ContactsPage />,
    },
    {
      path: "/collections/charges",
      labelKey: "modules.collections.routes.charges.label",
      descriptionKey: "modules.collections.routes.charges.description",
      icon: Receipt,
      element: <ChargesPage />,
    },
  ],
};
