import type { ProductPackagingUnit, ProductListBrand } from "@/modules/product/types/product-list";

export interface ProductDetailSegment {
  id?: string;
  name: string;
}

/** View model unificado para a página de detalhe. */
export interface ProductDetailView {
  id: string;
  productId: string;
  name: string;
  unitType: string;
  packagingUnit?: ProductPackagingUnit | null;
  brands: ProductListBrand[];
  segments: ProductDetailSegment[];
  establishmentName?: string;
}
