import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { batchUpdateVariations } from "@/modules/product/api/establishment-products-api";
import { EMPTY_VARIANT_ID } from "@/modules/product/lib/product-constants";
import { isVariationUnchanged } from "@/modules/product/lib/variation-utils";
import type {
  BatchEstablishmentProductVariationsPayload,
  EstablishmentProductWithVariants,
  ProductVariant,
  VariationState,
} from "@/modules/product/types/product-form";
import { ApiError } from "@/shared/api/http-client";

function newVariationId(): string {
  return crypto.randomUUID();
}

function initializeVariations(selectedProduct: EstablishmentProductWithVariants | null): VariationState[] {
  if (!selectedProduct?.variants) return [];

  return selectedProduct.variants.map((variantGroup: ProductVariant[]) => {
    const establishmentProductId = variantGroup[0]?.establishmentProductId;
    const quoteAnyBrand = variantGroup[0]?.quoteAnyBrand ?? false;
    return {
      id: establishmentProductId || newVariationId(),
      establishmentProductId,
      brands: [...variantGroup],
      quoteAnyBrand,
      isNew: !establishmentProductId,
      isModified: false,
      originalBrands: [...variantGroup],
      originalQuoteAnyBrand: quoteAnyBrand,
    };
  });
}

export function useEstablishmentProductVariationManagement(params: {
  selectedProduct: EstablishmentProductWithVariants | null;
  establishmentId: string;
}) {
  const { selectedProduct, establishmentId } = params;

  const [variations, setVariations] = useState<VariationState[]>(() =>
    initializeVariations(selectedProduct),
  );

  useEffect(() => {
    setVariations(initializeVariations(selectedProduct));
  }, [selectedProduct]);

  const addNewVariation = useCallback(() => {
    setVariations((prev) => [
      ...prev,
      {
        id: newVariationId(),
        brands: [],
        quoteAnyBrand: false,
        isNew: true,
        isModified: true,
        originalBrands: [],
        originalQuoteAnyBrand: false,
      },
    ]);
  }, []);

  const updateVariation = useCallback((variationId: string, updates: Partial<VariationState>) => {
    setVariations((prev) =>
      prev.map((variation) =>
        variation.id === variationId
          ? { ...variation, ...updates, isModified: true }
          : variation,
      ),
    );
  }, []);

  const removeVariation = useCallback((variationId: string) => {
    setVariations((prev) =>
      prev.map((variation) =>
        variation.id === variationId
          ? { ...variation, isDeleted: true, isModified: true }
          : variation,
      ),
    );
  }, []);

  const addBrandToVariation = useCallback(
    (
      variationId: string,
      brand: { id: string; name: string; isNew?: boolean },
    ) => {
      setVariations((prev) =>
        prev.map((variation) => {
          if (variation.id !== variationId) return variation;
          if (variation.brands.some((b) => b.id === brand.id)) return variation;

          const wasOriginallyInVariation = variation.originalBrands.some(
            (originalBrand) => originalBrand.id === brand.id,
          );

          const newBrand: ProductVariant = {
            id: brand.id,
            name: brand.name,
            status: brand.isNew && !wasOriginallyInVariation ? "pending" : "approved",
            establishmentProductId: variation.establishmentProductId || "",
            quoteAnyBrand: variation.quoteAnyBrand,
            isNew: brand.isNew && !wasOriginallyInVariation,
          };

          return {
            ...variation,
            brands: [...variation.brands, newBrand],
            isModified: true,
          };
        }),
      );
    },
    [],
  );

  const removeBrandFromVariation = useCallback((variationId: string, brandId: string) => {
    setVariations((prev) =>
      prev.map((variation) =>
        variation.id === variationId
          ? {
              ...variation,
              brands: variation.brands.filter((brand) => brand.id !== brandId),
              isModified: true,
            }
          : variation,
      ),
    );
  }, []);

  const resetToOriginal = useCallback(() => {
    setVariations(initializeVariations(selectedProduct));
  }, [selectedProduct]);

  const prepareBatchData = useCallback((): BatchEstablishmentProductVariationsPayload | null => {
    if (!selectedProduct || !establishmentId) return null;

    const result = variations.reduce<{
      create: NonNullable<BatchEstablishmentProductVariationsPayload["create"]>;
      update: NonNullable<BatchEstablishmentProductVariationsPayload["update"]>;
      deleteIds: string[];
    }>(
      (acc, variation) => {
        if (variation.isDeleted && variation.establishmentProductId) {
          acc.deleteIds.push(variation.establishmentProductId);
          return acc;
        }

        if (!variation.isModified || variation.isDeleted || isVariationUnchanged(variation)) {
          return acc;
        }

        const { brandIds, newBrandNames } = variation.brands.reduce<{
          brandIds: string[];
          newBrandNames: string[];
        }>(
          (brandAcc, brand) => {
            if (brand.isNew) {
              brandAcc.newBrandNames.push(brand.name);
            } else if (brand.id !== EMPTY_VARIANT_ID) {
              brandAcc.brandIds.push(brand.id);
            }
            return brandAcc;
          },
          { brandIds: [], newBrandNames: [] },
        );

        const variationData = {
          quoteAnyBrand: variation.quoteAnyBrand,
          brandIds,
          newBrandNames,
        };

        if (variation.isNew) {
          acc.create.push(variationData);
        } else if (variation.establishmentProductId) {
          acc.update.push({
            id: variation.establishmentProductId,
            changes: variationData,
          });
        }

        return acc;
      },
      { create: [], update: [], deleteIds: [] },
    );

    const hasOperations =
      result.create.length > 0 || result.update.length > 0 || result.deleteIds.length > 0;

    if (!hasOperations) return null;

    return {
      establishmentId,
      productId: selectedProduct.productId,
      ...(result.create.length > 0 && { create: result.create }),
      ...(result.update.length > 0 && { update: result.update }),
      ...(result.deleteIds.length > 0 && { delete: result.deleteIds }),
    };
  }, [variations, selectedProduct, establishmentId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const batchData = prepareBatchData();
      if (!batchData) return true as const;
      return batchUpdateVariations(batchData);
    },
  });

  const hasChanges = variations.some((v) => v.isModified);

  return {
    variations: variations.filter((v) => !v.isDeleted),
    addNewVariation,
    updateVariation,
    removeVariation,
    addBrandToVariation,
    removeBrandFromVariation,
    saveVariations: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error as ApiError | null,
    resetToOriginal,
    hasChanges,
    prepareBatchData,
  };
}
