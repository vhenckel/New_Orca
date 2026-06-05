export type ProductPackagingUnit = {
  unit: string;
  weight: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  categoryLabel: string;
  category: string;
  unit: string;
  unitPriceCents: number;
  brands: string[];
  packagingUnit?: ProductPackagingUnit | null;
};

/** @deprecated Mock-only shape; listagem usa AdminProductListItem. */
export type ProductListItem = {
  id: string;
  name: string;
  unit: string;
  brands: string[];
  segments: string[];
};

export type ProductBrandEntry = {
  id: string;
  name: string;
  initial: string;
  isActive: boolean;
};

/** @deprecated Mock-only; detalhe usa ProductDetailView. */
export type ProductDetailData = {
  list: ProductListItem;
  internalId: string;
  brands: ProductBrandEntry[];
};

export type {
  AdminProductListItem,
  EstablishmentProductListItem,
  EstablishmentProductSortField,
  FetchEstablishmentProductsListParams,
  FetchProductsListParams,
  ProductListBrand,
  ProductSortField,
  ProductsListPage,
  EstablishmentProductsListPage,
  SortOrder,
} from "@/modules/product/types/product-list";

export type { ProductDetailSegment, ProductDetailView } from "@/modules/product/types/product-detail";
