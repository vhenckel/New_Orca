export type CatalogProduct = {
  id: string;
  name: string;
  categoryLabel: string;
  category: string;
  unit: string;
  unitPriceCents: number;
  brands: string[];
};

/** Item na lista de produtos (/products). */
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

/** Detalhe de produto (/products/:id); mock até existir API. */
export type ProductDetailData = {
  list: ProductListItem;
  internalId: string;
  brands: ProductBrandEntry[];
};
