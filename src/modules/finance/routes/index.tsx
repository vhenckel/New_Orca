import { DollarSign, ListChecks, Receipt } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { PayoutDetailPage } from "@/modules/finance/pages/PayoutDetailPage";
import { PayoutsPage } from "@/modules/finance/pages/PayoutsPage";

export const financeModule: AppModuleDefinition = {
  key: "finance",
  basePath: "/finance/payouts",
  titleKey: "modules.finance.title",
  descriptionKey: "modules.finance.description",
  icon: DollarSign,
  hideInSidebar: true,
  routes: [
    {
      path: "/finance/payouts",
      labelKey: "modules.finance.routes.payouts.label",
      descriptionKey: "modules.finance.routes.payouts.description",
      icon: ListChecks,
      showPayoutMonthYearInTopBar: true,
      element: <PayoutsPage />,
    },
    {
      path: "/finance/payouts/:id",
      labelKey: "modules.finance.routes.payoutDetail.label",
      descriptionKey: "modules.finance.routes.payoutDetail.description",
      icon: Receipt,
      element: <PayoutDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.finance.routes.payouts.label",
        path: "/finance/payouts",
        preserveSearch: true,
      },
    },
  ],
};
