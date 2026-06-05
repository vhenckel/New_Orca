import type { VariationState } from "@/modules/product/types/product-form";

export function isVariationUnchanged(variation: VariationState): boolean {
  if (variation.isNew || variation.quoteAnyBrand !== variation.originalQuoteAnyBrand) {
    return false;
  }

  const currentBrandIds = variation.brands.map((brand) => brand.id).sort();
  const originalBrandIds = variation.originalBrands.map((brand) => brand.id).sort();

  return (
    currentBrandIds.length === originalBrandIds.length &&
    currentBrandIds.every((id, index) => id === originalBrandIds[index])
  );
}
