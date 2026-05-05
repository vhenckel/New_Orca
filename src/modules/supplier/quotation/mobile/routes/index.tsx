import { Inbox } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { MobileSupplierQuotationDetailPage } from "@/modules/supplier/quotation/mobile/pages/MobileSupplierQuotationDetailPage";
import { MobileSupplierQuotationsPage } from "@/modules/supplier/quotation/mobile/pages/MobileSupplierQuotationsPage";

export const supplierMobileQuotationModule: AppModuleDefinition = {
  key: "supplier-quotation-mobile",
  basePath: "/m/supplier/quotations",
  isMobile: true,
  hideInSidebar: true,
  allowedPersonas: ["supplier"],
  titleKey: "modules.supplierPortal.quotation.title",
  descriptionKey: "modules.supplierPortal.quotation.description",
  icon: Inbox,
  routes: [
    {
      path: "/m/supplier/quotations",
      labelKey: "modules.supplierPortal.quotation.routes.list.label",
      descriptionKey: "modules.supplierPortal.quotation.routes.list.description",
      icon: Inbox,
      element: <MobileSupplierQuotationsPage />,
    },
    {
      path: "/m/supplier/quotations/:id",
      labelKey: "modules.supplierPortal.quotation.routes.detail.label",
      descriptionKey: "modules.supplierPortal.quotation.routes.detail.description",
      icon: Inbox,
      element: <MobileSupplierQuotationDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.supplierPortal.quotation.routes.list.label",
        path: "/m/supplier/quotations",
      },
    },
  ],
};
