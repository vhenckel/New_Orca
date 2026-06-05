import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  createEstablishmentProduct,
  updateEstablishmentProduct,
} from "@/modules/product/api/establishment-products-api";
import { createProduct, updateProduct } from "@/modules/product/api/products-api";
import { toApiPayload } from "@/modules/product/lib/normalize-product-payload";
import type { ProductFormSchemaValues } from "@/modules/product/lib/product-form-schema";
import type { EstablishmentProductWithVariants } from "@/modules/product/types/product-form";
import { ApiError } from "@/shared/api/http-client";
import { useI18n } from "@/shared/i18n/useI18n";
import { toast } from "@/shared/ui/sonner";

export interface ProductSubmissionContext {
  isAdmin: boolean;
  isEstablishment: boolean;
  mode: "create" | "edit";
  selectedProductId?: string;
  selectedEstablishmentProductId?: string;
  selectedExistingProduct: EstablishmentProductWithVariants | null;
  selectedExistingProductId: string | null;
  selectedProductLabel: string | null;
  onVariationsSaved?: () => Promise<boolean>;
}

function cleanProductName(
  name: string,
  isEstablishment: boolean,
  selectedProductLabel: string | null,
): string {
  if (name.startsWith("new_")) return name.substring(4);
  if (isEstablishment && selectedProductLabel) return selectedProductLabel;
  return name;
}

export function useProductSubmission(ctx: ProductSubmissionContext) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const invalidateLists = async () => {
    await queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    await queryClient.invalidateQueries({ queryKey: ["establishment-products", "list"] });
  };

  const handleSuccess = async (messageKey: string) => {
    await invalidateLists();
    toast.success(t(messageKey as never));
    navigate("/products");
  };

  const handleError = (error: unknown, fallbackKey: string) => {
    const message =
      error instanceof ApiError ? error.message : t(fallbackKey as never);
    toast.error(message);
  };

  const submitMutation = useMutation({
    mutationFn: async (values: ProductFormSchemaValues) => {
      const cleanedName = cleanProductName(
        values.name,
        ctx.isEstablishment,
        ctx.selectedProductLabel,
      );

      const payload = toApiPayload({
        ...values,
        name: cleanedName,
        ncm: values.ncm || undefined,
        establishmentId: values.establishmentId || undefined,
      });

      if (ctx.isAdmin) {
        if (ctx.mode === "edit" && ctx.selectedProductId) {
          return updateProduct(ctx.selectedProductId, payload);
        }
        return createProduct(payload);
      }

      const status = ctx.selectedExistingProduct?.status?.toLowerCase();
      const isNewProduct = values.name.startsWith("new_");

      if (ctx.mode === "edit" && ctx.selectedEstablishmentProductId) {
        if (status !== "approved") {
          await updateEstablishmentProduct(ctx.selectedEstablishmentProductId, payload);
          return { type: "establishment-update" as const };
        }
        if (ctx.onVariationsSaved) {
          await ctx.onVariationsSaved();
        }
        return { type: "variations-only" as const };
      }

      if (isNewProduct) {
        if (!values.establishmentId) {
          throw new Error(t("modules.product.form.errors.establishmentRequired"));
        }
        return createEstablishmentProduct({
          ...payload,
          establishmentId: values.establishmentId,
        });
      }

      if (
        ctx.selectedExistingProductId &&
        status !== "approved"
      ) {
        return updateProduct(ctx.selectedExistingProductId, payload);
      }

      if (ctx.onVariationsSaved) {
        await ctx.onVariationsSaved();
      }

      return { type: "variations-only" as const };
    },
    onSuccess: async (result, values) => {
      if (ctx.isAdmin) {
        await handleSuccess(
          ctx.mode === "edit"
            ? "modules.product.form.toast.updated"
            : "modules.product.form.toast.created",
        );
        return;
      }

      if (values.name.startsWith("new_")) {
        await handleSuccess("modules.product.form.toast.createdPending");
        return;
      }

      if (result && typeof result === "object" && "type" in result) {
        if (result.type === "variations-only") {
          await handleSuccess("modules.product.form.toast.variationsUpdated");
          return;
        }
        await handleSuccess("modules.product.form.toast.updated");
        return;
      }

      await handleSuccess("modules.product.form.toast.updated");
    },
    onError: (error) => {
      handleError(error, "modules.product.form.toast.saveError");
    },
  });

  return {
    submit: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}
