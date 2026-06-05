import { Package } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { ImportProductsPage } from "@/modules/product/pages/ImportProductsPage";
import { ManageProductBrandsPage } from "@/modules/product/pages/ManageProductBrandsPage";
import { ProductDetailRedirect } from "@/modules/product/pages/ProductDetailRedirect";
import { ProductFormPage } from "@/modules/product/pages/ProductFormPage";
import { ProductsPage } from "@/modules/product/pages/ProductsPage";

export const productModule: AppModuleDefinition = {
  key: "product",
  basePath: "/products",
  allowedPersonas: ["buyer", "admin"],
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
      allowedApiRoles: ["admin", "establishment"],
    },
    {
      path: "/products/create",
      labelKey: "modules.product.routes.create.label",
      descriptionKey: "modules.product.routes.create.description",
      icon: Package,
      element: <ProductFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin", "establishment"],
      topBarParent: {
        labelKey: "modules.product.routes.main.label",
        path: "/products",
      },
    },
    {
      path: "/products/import",
      labelKey: "modules.product.routes.import.label",
      descriptionKey: "modules.product.routes.import.description",
      icon: Package,
      element: <ImportProductsPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.product.routes.main.label",
        path: "/products",
      },
    },
    {
      path: "/products/manage-brands/:establishmentId",
      labelKey: "modules.product.routes.manageBrands.label",
      descriptionKey: "modules.product.routes.manageBrands.description",
      icon: Package,
      element: <ManageProductBrandsPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.product.routes.main.label",
        path: "/products",
      },
    },
    {
      path: "/products/:id/edit",
      labelKey: "modules.product.routes.edit.label",
      descriptionKey: "modules.product.routes.edit.description",
      icon: Package,
      element: <ProductFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin", "establishment"],
      topBarParent: {
        labelKey: "modules.product.routes.main.label",
        path: "/products",
      },
    },
    {
      path: "/products/:id",
      labelKey: "modules.product.routes.detail.label",
      descriptionKey: "modules.product.routes.detail.description",
      icon: Package,
      element: <ProductDetailRedirect />,
      hideInSidebar: true,
      allowedApiRoles: ["admin", "establishment"],
    },
  ],
};
