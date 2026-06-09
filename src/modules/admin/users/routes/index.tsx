import { Users } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AdminUserFormPage } from "@/modules/admin/users/pages/AdminUserFormPage";
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
      allowedApiRoles: ["admin"],
    },
    {
      path: "/admin/users/create",
      labelKey: "modules.admin.users.routes.create.label",
      descriptionKey: "modules.admin.users.routes.create.description",
      icon: Users,
      element: <AdminUserFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.admin.users.routes.main.label",
        path: "/admin/users",
      },
    },
  ],
};
