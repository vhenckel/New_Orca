import { Package } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { ProductDetailPage } from "@/modules/product/pages/ProductDetailPage";
import { ProductsPage } from "@/modules/product/pages/ProductsPage";

export const productModule: AppModuleDefinition = {
  key: "product",
  basePath: "/products",
  titleKey: "modules.product.title",
  descriptionKey: "modules.product.description",
  icon: Package,
  routes: [
    {
      path: "/products",
      labelKey: "modules.product.routes.main.label",
      descriptionKey: "modules.product.routes.main.description",
      icon: Package,
      element: <ProductsPage />,
    },
    {
      path: "/products/:id",
      labelKey: "modules.product.routes.detail.label",
      descriptionKey: "modules.product.routes.detail.description",
      icon: Package,
      element: <ProductDetailPage />,
      hideInSidebar: true,
      topBarParent: {
        labelKey: "modules.product.routes.main.label",
        path: "/products",
      },
    },
  ],
};
