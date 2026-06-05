import type { ProductApiPayload, ProductFormPackaging } from "@/modules/product/types/product-form";
import type { ProductUnitType } from "@/modules/product/lib/product-constants";

function normalizePackagingUnit(
  unitType: ProductUnitType,
  packagingUnit?: ProductFormPackaging | null,
): ProductApiPayload["packagingUnit"] {
  if (unitType !== "un") return undefined;
  if (!packagingUnit?.unit || packagingUnit.weight == null) return undefined;
  return { unit: packagingUnit.unit, weight: packagingUnit.weight };
}

export function normalizeProductPayload<T extends ProductApiPayload>(data: T): T {
  return {
    ...data,
    packagingUnit: normalizePackagingUnit(data.unitType, data.packagingUnit),
  };
}

export function toApiPayload(values: {
  name: string;
  brands: Array<{ id?: string; name: string; gtin?: string }>;
  unitType: ProductUnitType;
  packagingUnit?: ProductFormPackaging;
  segmentIds: string[];
  ncm?: string;
  establishmentId?: string;
  quoteAnyBrand?: boolean;
}): ProductApiPayload {
  const payload: ProductApiPayload = {
    name: values.name,
    brands: values.brands.map((b) => ({
      ...(b.id ? { id: b.id } : {}),
      name: b.name,
      ...(b.gtin ? { gtin: b.gtin } : {}),
    })),
    unitType: values.unitType,
    segmentIds: values.segmentIds,
    ...(values.ncm ? { ncm: values.ncm } : {}),
    ...(values.establishmentId ? { establishmentId: values.establishmentId } : {}),
    ...(values.quoteAnyBrand !== undefined ? { quoteAnyBrand: values.quoteAnyBrand } : {}),
  };
  return normalizeProductPayload(payload);
}
