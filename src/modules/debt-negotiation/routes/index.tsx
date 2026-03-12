import { FileText, LayoutDashboard, Landmark, Users } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { ContactDetailPage } from "@/modules/debt-negotiation/pages/ContactDetailPage";
import { ContactsPage } from "@/modules/debt-negotiation/pages/ContactsPage";
import { DashboardPage } from "@/modules/debt-negotiation/pages/DashboardPage";
import { DebtsPage } from "@/modules/debt-negotiation/pages/DebtsPage";

export const debtNegotiationModule: AppModuleDefinition = {
  key: "debt-negotiation",
  basePath: "/debt-negotiation",
  titleKey: "modules.debtNegotiation.title",
  descriptionKey: "modules.debtNegotiation.description",
  icon: Landmark,
  routes: [
    {
      path: "/debt-negotiation",
      labelKey: "modules.debtNegotiation.routes.dashboard.label",
      descriptionKey: "modules.debtNegotiation.routes.dashboard.description",
      icon: LayoutDashboard,
      element: <DashboardPage />,
    },
    {
      path: "/debt-negotiation/contacts",
      labelKey: "modules.debtNegotiation.routes.contacts.label",
      descriptionKey: "modules.debtNegotiation.routes.contacts.description",
      icon: Users,
      element: <ContactsPage />,
    },
    {
      path: "/debt-negotiation/contacts/:id",
      labelKey: "modules.debtNegotiation.routes.contacts.label",
      descriptionKey: "modules.debtNegotiation.routes.contacts.description",
      icon: Users,
      element: <ContactDetailPage />,
      hideInSidebar: true,
    },
    {
      path: "/debt-negotiation/debts",
      labelKey: "modules.debtNegotiation.routes.debts.label",
      descriptionKey: "modules.debtNegotiation.routes.debts.description",
      icon: FileText,
      element: <DebtsPage />,
    },
  ],
};
