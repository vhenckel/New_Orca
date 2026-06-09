import { Building2 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SupplierCompaniesPage } from "@/modules/admin/supplier-companies/pages/SupplierCompaniesPage";
import { SupplierCompanyFormPage } from "@/modules/admin/supplier-companies/pages/SupplierCompanyFormPage";

export const adminSupplierCompaniesModule: AppModuleDefinition = {
  key: "admin-supplier-companies",
  basePath: "/supplier-companies",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.supplierCompanies.title",
  descriptionKey: "modules.admin.supplierCompanies.description",
  icon: Building2,
  routes: [
    {
      path: "/supplier-companies",
      labelKey: "modules.admin.supplierCompanies.routes.main.label",
      descriptionKey: "modules.admin.supplierCompanies.routes.main.description",
      icon: Building2,
      element: <SupplierCompaniesPage />,
      allowedApiRoles: ["admin"],
    },
    {
      path: "/supplier-companies/create",
      labelKey: "modules.admin.supplierCompanies.routes.create.label",
      descriptionKey: "modules.admin.supplierCompanies.routes.create.description",
      icon: Building2,
      element: <SupplierCompanyFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.admin.supplierCompanies.routes.main.label",
        path: "/supplier-companies",
      },
    },
    {
      path: "/supplier-companies/:id/edit",
      labelKey: "modules.admin.supplierCompanies.routes.edit.label",
      descriptionKey: "modules.admin.supplierCompanies.routes.edit.description",
      icon: Building2,
      element: <SupplierCompanyFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.admin.supplierCompanies.routes.main.label",
        path: "/supplier-companies",
      },
    },
  ],
};
