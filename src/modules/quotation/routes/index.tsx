import { ReceiptText } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { CreateQuotationPage } from "@/modules/quotation/pages/CreateQuotationPage";
import { QuotationsPage } from "@/modules/quotation/pages/QuotationsPage";

export const quotationModule: AppModuleDefinition = {
  key: "quotation",
  basePath: "/quotations",
  titleKey: "modules.quotation.title",
  descriptionKey: "modules.quotation.description",
  icon: ReceiptText,
  routes: [
    {
      path: "/quotations",
      labelKey: "modules.quotation.routes.quotations.label",
      descriptionKey: "modules.quotation.routes.quotations.description",
      icon: ReceiptText,
      element: <QuotationsPage />,
    },
    {
      path: "/quotations/new",
      labelKey: "modules.quotation.routes.quotationsNew.label",
      descriptionKey: "modules.quotation.routes.quotationsNew.description",
      icon: ReceiptText,
      element: <CreateQuotationPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.quotation.routes.quotations.label",
        path: "/quotations",
      },
    },
  ],
};
