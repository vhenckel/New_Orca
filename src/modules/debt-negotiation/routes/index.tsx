import { FileText, LayoutDashboard, Landmark, Users } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { ContactDetailPage } from "@/modules/debt-negotiation/pages/ContactDetailPage";
import { ContactsPage } from "@/modules/debt-negotiation/pages/ContactsPage";
import { DashboardPage } from "@/modules/debt-negotiation/pages/DashboardPage";
import { DebtsPage } from "@/modules/debt-negotiation/pages/DebtsPage";
import { ImportDebtsWizardPage } from "@/modules/debt-negotiation/pages/ImportDebtsWizardPage";
import { NegotiatedDetailsPage } from "@/modules/debt-negotiation/pages/NegotiatedDetailsPage";
import { RecoveredDetailsPage } from "@/modules/debt-negotiation/pages/RecoveredDetailsPage";
import { RenegotiationDetailsPage } from "@/modules/debt-negotiation/pages/RenegotiationDetailsPage";

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
      showDebtNegotiationDateRangeInTopBar: true,
      showImportDebtsInTopBar: true,
    },
    {
      path: "/debt-negotiation/debts",
      labelKey: "modules.debtNegotiation.routes.debts.label",
      descriptionKey: "modules.debtNegotiation.routes.debts.description",
      icon: FileText,
      element: <DebtsPage />,
      showDebtNegotiationDateRangeInTopBar: true,
      showImportDebtsInTopBar: true,
    },
    {
      path: "/debt-negotiation/debts/import",
      labelKey: "pages.debtNegotiation.importDebts.title",
      descriptionKey: "pages.debtNegotiation.importDebts.subtitle",
      icon: FileText,
      element: <ImportDebtsWizardPage />,
      hideInSidebar: true,
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
      labelKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      descriptionKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      icon: Users,
      element: <ContactDetailPage />,
      hideInSidebar: true,
    },
    {
      path: "/debt-negotiation/renegotiation-details",
      labelKey: "pages.debtNegotiation.detail.renegotiation.title",
      descriptionKey: "pages.debtNegotiation.detail.renegotiation.subtitle",
      icon: FileText,
      element: <RenegotiationDetailsPage />,
      hideInSidebar: true,
      showDebtNegotiationDateRangeInTopBar: true,
    },
    {
      path: "/debt-negotiation/negotiated-details",
      labelKey: "pages.debtNegotiation.detail.negotiated.title",
      descriptionKey: "pages.debtNegotiation.detail.negotiated.subtitle",
      icon: FileText,
      element: <NegotiatedDetailsPage />,
      hideInSidebar: true,
      showDebtNegotiationDateRangeInTopBar: true,
    },
    {
      path: "/debt-negotiation/recovered-details",
      labelKey: "pages.debtNegotiation.detail.recovered.title",
      descriptionKey: "pages.debtNegotiation.detail.recovered.subtitle",
      icon: FileText,
      element: <RecoveredDetailsPage />,
      hideInSidebar: true,
      showDebtNegotiationDateRangeInTopBar: true,
    },
  ],
};
