import type { ApprovalStatus, PackagingUnitType, ProductUnitType } from "@/modules/product/lib/product-constants";

export interface ProductFormBrand {
  id?: string;
  name: string;
  gtin?: string;
  status?: ApprovalStatus;
}

export interface ProductFormPackaging {
  unit?: PackagingUnitType;
  weight?: number;
}

export interface ProductFormValues {
  name: string;
  brands: ProductFormBrand[];
  unitType: ProductUnitType;
  packagingUnit?: ProductFormPackaging;
  segmentIds: string[];
  ncm?: string;
  status: ApprovalStatus;
  establishmentId?: string;
  quoteAnyBrand?: boolean;
}

export interface ProductApiPayload {
  name: string;
  brands: Array<{ id?: string; name: string; gtin?: string }>;
  unitType: ProductUnitType;
  packagingUnit?: { unit: PackagingUnitType; weight: number };
  segmentIds: string[];
  ncm?: string;
  establishmentId?: string;
  quoteAnyBrand?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  status: ApprovalStatus;
  establishmentProductId: string;
  quoteAnyBrand: boolean;
  isNew?: boolean;
}

export interface EstablishmentProductWithVariants {
  id: string;
  productId: string;
  establishmentProductId: string;
  name: string;
  unitType: string;
  packagingUnit?: { unit: string; weight: number } | null;
  segments: Array<{ id: string; name: string }>;
  establishment: { id: string; name: string };
  quoteAnyBrand: boolean;
  status: ApprovalStatus;
  ncm?: string | null;
  variants: ProductVariant[][];
}

export interface VariationState {
  id: string;
  establishmentProductId?: string;
  brands: ProductVariant[];
  quoteAnyBrand: boolean;
  isNew: boolean;
  isModified: boolean;
  isDeleted?: boolean;
  originalBrands: ProductVariant[];
  originalQuoteAnyBrand: boolean;
}

export interface BatchVariationOperation {
  quoteAnyBrand?: boolean;
  brandIds?: string[];
  newBrandNames?: string[];
}

export interface BatchUpdateVariationItem {
  id: string;
  changes: BatchVariationOperation;
}

export interface BatchEstablishmentProductVariationsPayload {
  establishmentId: string;
  productId: string;
  create?: BatchVariationOperation[];
  update?: BatchUpdateVariationItem[];
  delete?: string[];
}
