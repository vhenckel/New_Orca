import { BarChart3, LayoutDashboard, Package, ReceiptText, Store } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AnalyticsPage } from "@/modules/quotation/pages/AnalyticsPage";
import { CreateQuotationPage } from "@/modules/quotation/pages/CreateQuotationPage";
import { DashboardPage } from "@/modules/quotation/pages/DashboardPage";
import { ProductDetailPage } from "@/modules/quotation/pages/ProductDetailPage";
import { ProductsPage } from "@/modules/quotation/pages/ProductsPage";
import { QuotationsPage } from "@/modules/quotation/pages/QuotationsPage";
import { SupplierDetailPage } from "@/modules/quotation/pages/SupplierDetailPage";
import { SuppliersPage } from "@/modules/quotation/pages/SuppliersPage";

export const quotationModule: AppModuleDefinition = {
  key: "quotation",
  basePath: "/dashboard",
  titleKey: "modules.quotation.title",
  descriptionKey: "modules.quotation.description",
  icon: LayoutDashboard,
  routes: [
    {
      path: "/dashboard",
      labelKey: "modules.quotation.routes.dashboard.label",
      descriptionKey: "modules.quotation.routes.dashboard.description",
      icon: LayoutDashboard,
      element: <DashboardPage />,
    },
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
    {
      path: "/products",
      labelKey: "modules.quotation.routes.products.label",
      descriptionKey: "modules.quotation.routes.products.description",
      icon: Package,
      element: <ProductsPage />,
    },
    {
      path: "/products/:id",
      labelKey: "modules.quotation.routes.productsDetail.label",
      descriptionKey: "modules.quotation.routes.productsDetail.description",
      icon: Package,
      element: <ProductDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.quotation.routes.products.label",
        path: "/products",
      },
    },
    {
      path: "/suppliers",
      labelKey: "modules.quotation.routes.suppliers.label",
      descriptionKey: "modules.quotation.routes.suppliers.description",
      icon: Store,
      element: <SuppliersPage />,
    },
    {
      path: "/suppliers/:id",
      labelKey: "modules.quotation.routes.suppliersDetail.label",
      descriptionKey: "modules.quotation.routes.suppliersDetail.description",
      icon: Store,
      element: <SupplierDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.quotation.routes.suppliers.label",
        path: "/suppliers",
      },
    },
    {
      path: "/analytics",
      labelKey: "modules.quotation.routes.analytics.label",
      descriptionKey: "modules.quotation.routes.analytics.description",
      icon: BarChart3,
      element: <AnalyticsPage />,
    },
  ],
};
