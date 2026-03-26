import { Ban, Users } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { ContactBlocklistPage } from "@/modules/contact/pages/ContactBlocklistPage";
import { ContactDetailPage } from "@/modules/contact/pages/ContactDetailPage";
import { ContactsPage } from "@/modules/contact/pages/ContactsPage";

/** Rotas em `/debt-negotiation/contacts*`. Deve vir antes de `debtNegotiationModule` em `businessModules` para o `AppShell` resolver o módulo atual. */
export const contactModule: AppModuleDefinition = {
  key: "contact",
  basePath: "/debt-negotiation/contacts",
  titleKey: "modules.contact.title",
  descriptionKey: "modules.contact.description",
  icon: Users,
  routes: [
    {
      path: "/debt-negotiation/contacts",
      labelKey: "modules.contact.routes.list.label",
      descriptionKey: "modules.contact.routes.list.description",
      icon: Users,
      element: <ContactsPage />,
    },
    {
      path: "/debt-negotiation/contacts/blocklist",
      labelKey: "modules.contact.routes.blocklist.label",
      descriptionKey: "modules.contact.routes.blocklist.description",
      icon: Ban,
      element: <ContactBlocklistPage />,
      topBarParent: {
        labelKey: "modules.contact.routes.list.label",
        path: "/debt-negotiation/contacts",
        preserveSearch: true,
      },
    },
    {
      path: "/debt-negotiation/contacts/:id",
      labelKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      descriptionKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      icon: Users,
      element: <ContactDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.contact.routes.list.label",
        path: "/debt-negotiation/contacts",
        preserveSearch: true,
      },
    },
  ],
};
