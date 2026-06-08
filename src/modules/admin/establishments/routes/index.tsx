import { Store } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { EstablishmentFormPage } from "@/modules/admin/establishments/pages/EstablishmentFormPage";
import { EstablishmentsPage } from "@/modules/admin/establishments/pages/EstablishmentsPage";

export const adminEstablishmentsModule: AppModuleDefinition = {
  key: "admin-establishments",
  basePath: "/estabelecimentos",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.establishments.title",
  descriptionKey: "modules.admin.establishments.description",
  icon: Store,
  routes: [
    {
      path: "/estabelecimentos",
      labelKey: "modules.admin.establishments.routes.main.label",
      descriptionKey: "modules.admin.establishments.routes.main.description",
      icon: Store,
      element: <EstablishmentsPage />,
      allowedApiRoles: ["admin"],
    },
    {
      path: "/estabelecimentos/criar-estabelecimento",
      labelKey: "modules.admin.establishments.routes.create.label",
      descriptionKey: "modules.admin.establishments.routes.create.description",
      icon: Store,
      element: <EstablishmentFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.admin.establishments.routes.main.label",
        path: "/estabelecimentos",
      },
    },
    {
      path: "/estabelecimentos/editar-estabelecimento/:id",
      labelKey: "modules.admin.establishments.routes.edit.label",
      descriptionKey: "modules.admin.establishments.routes.edit.description",
      icon: Store,
      element: <EstablishmentFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.admin.establishments.routes.main.label",
        path: "/estabelecimentos",
      },
    },
  ],
};
