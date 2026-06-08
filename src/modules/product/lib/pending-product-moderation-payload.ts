import type { ProductFormSchemaValues } from "@/modules/product/lib/product-form-schema";
import type {
  PendingProductDetail,
  PendingProductModerationPayload,
} from "@/modules/product/types/pending-product";

export function mapPendingProductToForm(
  product: PendingProductDetail,
): ProductFormSchemaValues {
  return {
    name: product.name,
    brands: (product.brands ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      gtin: b.gtin ?? "",
      status: b.status,
    })),
    unitType: product.unitType as "kg" | "un",
    packagingUnit: product.packagingUnit
      ? {
          unit: product.packagingUnit.unit as never,
          weight: product.packagingUnit.weight,
        }
      : { unit: undefined, weight: undefined },
    segmentIds: (product.segments ?? []).map((s) => s.id),
    ncm: product.ncm ?? "",
    status: product.status,
    establishmentId: product.establishmentId ?? "",
    quoteAnyBrand: false,
  };
}

export function buildModerationPayload(
  values: ProductFormSchemaValues,
  detail: PendingProductDetail,
): PendingProductModerationPayload {
  return {
    name: values.name,
    unitType: values.unitType,
    packagingUnit:
      values.unitType === "un" && values.packagingUnit?.unit && values.packagingUnit.weight != null
        ? { unit: values.packagingUnit.unit, weight: values.packagingUnit.weight }
        : undefined,
    segmentIds: values.segmentIds,
    ncm: values.ncm || undefined,
    establishmentId: detail.establishmentId || undefined,
    solicitorEstablishmentId: detail.solicitorEstablishmentId || undefined,
    quoteAnyBrand: values.quoteAnyBrand ?? false,
    brands: values.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      gtin: brand.gtin || undefined,
      status: brand.status,
      establishmentId: detail.brands.find((b) => b.id === brand.id)?.establishmentId || undefined,
    })),
  };
}

export function buildBrandModerationPayload(
  brandId: string,
  values: ProductFormSchemaValues,
  detail: PendingProductDetail,
): PendingProductModerationPayload | undefined {
  const targetBrand = values.brands.find((brand) => brand.id === brandId);
  if (!targetBrand) return undefined;

  const detailBrand = detail.brands.find((b) => b.id === brandId);

  return {
    name: detail.name,
    unitType: detail.unitType,
    packagingUnit: detail.packagingUnit ?? undefined,
    segmentIds: detail.segments.map((s) => s.id),
    ncm: detail.ncm || undefined,
    establishmentId: detail.establishmentId || undefined,
    solicitorEstablishmentId: detail.solicitorEstablishmentId || undefined,
    quoteAnyBrand: values.quoteAnyBrand ?? false,
    brands: [
      {
        id: targetBrand.id,
        name: targetBrand.name,
        gtin: targetBrand.gtin || undefined,
        status: targetBrand.status,
        establishmentId: detailBrand?.establishmentId || undefined,
      },
    ],
  };
}
