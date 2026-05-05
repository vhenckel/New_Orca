import { Inbox } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SupplierQuotationDetailPage } from "@/modules/supplier/quotation/pages/SupplierQuotationDetailPage";
import { SupplierQuotationsPage } from "@/modules/supplier/quotation/pages/SupplierQuotationsPage";

export const supplierQuotationModule: AppModuleDefinition = {
  key: "supplier-quotation",
  basePath: "/supplier/quotations",
  allowedPersonas: ["supplier"],
  titleKey: "modules.supplierPortal.quotation.title",
  descriptionKey: "modules.supplierPortal.quotation.description",
  icon: Inbox,
  routes: [
    {
      path: "/supplier/quotations",
      labelKey: "modules.supplierPortal.quotation.routes.list.label",
      descriptionKey: "modules.supplierPortal.quotation.routes.list.description",
      icon: Inbox,
      element: <SupplierQuotationsPage />,
    },
    {
      path: "/supplier/quotations/:id",
      labelKey: "modules.supplierPortal.quotation.routes.detail.label",
      descriptionKey: "modules.supplierPortal.quotation.routes.detail.description",
      icon: Inbox,
      element: <SupplierQuotationDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.supplierPortal.quotation.routes.list.label",
        path: "/supplier/quotations",
      },
    },
  ],
};
