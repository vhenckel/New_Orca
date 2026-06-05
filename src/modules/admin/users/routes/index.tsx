import { Users } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AdminUsersPage } from "@/modules/admin/users/pages/AdminUsersPage";

export const adminUsersModule: AppModuleDefinition = {
  key: "admin-users",
  basePath: "/admin/users",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.users.title",
  descriptionKey: "modules.admin.users.description",
  icon: Users,
  routes: [
    {
      path: "/admin/users",
      labelKey: "modules.admin.users.routes.main.label",
      descriptionKey: "modules.admin.users.routes.main.description",
      icon: Users,
      element: <AdminUsersPage />,
    },
  ],
};
