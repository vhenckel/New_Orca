import { Ban, Users } from "lucide-react";
import { Navigate, useLocation, useParams } from "react-router-dom";

import type { AppModuleDefinition } from "@/app/router/types";
import { ContactBlocklistPage } from "@/modules/contact/pages/ContactBlocklistPage";
import { ContactDetailPage } from "@/modules/contact/pages/ContactDetailPage";
import { ContactsPage } from "@/modules/contact/pages/ContactsPage";

function LegacyContactsRootRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: "/contacts", search: location.search }} replace />;
}

function LegacyContactsBlocklistRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: "/contacts/blocklist", search: location.search }} replace />;
}

function LegacyContactDetailRedirect() {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const nextPathname = id ? `/contacts/${id}` : "/contacts";
  return <Navigate to={{ pathname: nextPathname, search: location.search }} replace />;
}

/** Rotas em `/contacts*` (com redirects legacy a partir de `/debt-negotiation/contacts*`). */
export const contactModule: AppModuleDefinition = {
  key: "contact",
  basePath: "/contacts",
  titleKey: "modules.contact.title",
  descriptionKey: "modules.contact.description",
  icon: Users,
  hideInSidebar: true,
  routes: [
    {
      path: "/contacts",
      labelKey: "modules.contact.routes.list.label",
      descriptionKey: "modules.contact.routes.list.description",
      icon: Users,
      element: <ContactsPage />,
    },
    {
      path: "/contacts/blocklist",
      labelKey: "modules.contact.routes.blocklist.label",
      descriptionKey: "modules.contact.routes.blocklist.description",
      icon: Ban,
      element: <ContactBlocklistPage />,
      topBarParent: {
        labelKey: "modules.contact.routes.list.label",
        path: "/contacts",
        preserveSearch: true,
      },
    },
    {
      path: "/contacts/:id",
      labelKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      descriptionKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      icon: Users,
      element: <ContactDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.contact.routes.list.label",
        path: "/contacts",
        preserveSearch: true,
      },
    },
    // Legacy redirects (keeps old links working)
    {
      path: "/debt-negotiation/contacts",
      labelKey: "modules.contact.routes.list.label",
      descriptionKey: "modules.contact.routes.list.description",
      icon: Users,
      element: <LegacyContactsRootRedirect />,
      hideInSidebar: true,
    },
    {
      path: "/debt-negotiation/contacts/blocklist",
      labelKey: "modules.contact.routes.blocklist.label",
      descriptionKey: "modules.contact.routes.blocklist.description",
      icon: Ban,
      element: <LegacyContactsBlocklistRedirect />,
      hideInSidebar: true,
    },
    {
      path: "/debt-negotiation/contacts/:id",
      labelKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      descriptionKey: "pages.debtNegotiation.contactDetail.detailsTitle",
      icon: Users,
      element: <LegacyContactDetailRedirect />,
      hideInSidebar: true,
    },
  ],
};
