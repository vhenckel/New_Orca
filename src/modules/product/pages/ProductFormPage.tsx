import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  fetchEstablishmentProductById,
  fetchProductVariants,
  fetchProductsWithVariants,
} from "@/modules/product/api/establishment-products-api";
import { fetchProductById } from "@/modules/product/api/products-api";
import { ProductBrandsTable } from "@/modules/product/components/ProductBrandsTable";
import { ProductCoreFields } from "@/modules/product/components/ProductCoreFields";
import { ProductFormSkeleton } from "@/modules/product/components/ProductFormSkeleton";
import {
  ProductVariationsSection,
  type ProductVariationsSectionHandle,
} from "@/modules/product/components/ProductVariationsSection";
import { useProductSubmission } from "@/modules/product/hooks/useProductSubmission";
import { useProductListSupportQueries } from "@/modules/product/hooks/useProductListSupportQueries";
import {
  clearProductFormAutostore,
  readProductFormAutostore,
  writeProductFormAutostore,
} from "@/modules/product/lib/product-autostore";
import {
  defaultProductFormValues,
  productFormSchema,
  type ProductFormSchemaValues,
} from "@/modules/product/lib/product-form-schema";
import { isCoreFieldsDisabled, resolveProductFormMode } from "@/modules/product/lib/product-form-mode";
import type { EstablishmentProductWithVariants } from "@/modules/product/types/product-form";
import { fetchMyEstablishments } from "@/modules/buyer/quotation/api/establishments-api";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useApiUser, useApiUserRole } from "@/shared/auth/use-api-user";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { toast } from "@/shared/ui/sonner";

function mapAdminProductToForm(
  product: Awaited<ReturnType<typeof fetchProductById>>,
): ProductFormSchemaValues {
  const segments = (product.segments ?? []).map((s) =>
    typeof s === "string" ? s : s.id,
  );
  return {
    name: product.name,
    brands: (product.brands ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      gtin: b.gtin,
      status: (b.status as ProductFormSchemaValues["status"]) ?? "approved",
    })),
    unitType: product.unitType as "kg" | "un",
    packagingUnit: product.packagingUnit
      ? {
          unit: product.packagingUnit.unit as never,
          weight: product.packagingUnit.weight,
        }
      : { unit: undefined, weight: undefined },
    segmentIds: segments,
    ncm: product.ncm ?? "",
    status: (product.status as ProductFormSchemaValues["status"]) ?? "approved",
    establishmentId: product.establishmentId ?? "",
    quoteAnyBrand: false,
  };
}

function mapEstablishmentProductToForm(
  product: Awaited<ReturnType<typeof fetchEstablishmentProductById>>,
): ProductFormSchemaValues {
  return {
    name: product.productId,
    brands: (product.brands ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      status: (b.status as ProductFormSchemaValues["status"]) ?? "approved",
    })),
    unitType: product.unitType as "kg" | "un",
    packagingUnit: product.packagingUnit
      ? {
          unit: product.packagingUnit.unit as never,
          weight: product.packagingUnit.weight,
        }
      : { unit: undefined, weight: undefined },
    segmentIds: product.segments.map((s) => s.id),
    ncm: "",
    status: (product.status as ProductFormSchemaValues["status"]) ?? "approved",
    establishmentId: product.establishment.id,
    quoteAnyBrand: product.quoteAnyBrand,
  };
}

export function ProductFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const role = useApiUserRole();
  const apiUser = useApiUser();
  const mode = resolveProductFormMode(location.pathname);
  const isAdmin = role === "admin";
  const isEstablishment = role === "establishment";

  const [productSearch, setProductSearch] = useState("");
  const [selectedExisting, setSelectedExisting] = useState<EstablishmentProductWithVariants | null>(
    null,
  );
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const variationsRef = useRef<ProductVariationsSectionHandle | null>(null);

  const form = useForm<ProductFormSchemaValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues,
  });

  const establishmentId =
    form.watch("establishmentId") ||
    selectedExisting?.establishment?.id ||
    "";

  const { segments } = useProductListSupportQueries(role);

  const { data: establishments = [] } = useQuery({
    queryKey: ["my-establishments", "product-form"],
    queryFn: () => fetchMyEstablishments(),
    enabled: isEstablishment,
  });

  const showEstablishmentField = isEstablishment && establishments.length > 1;

  useEffect(() => {
    if (!isEstablishment || showEstablishmentField) return;
    if (establishments.length === 1) {
      form.setValue("establishmentId", establishments[0].id);
    }
  }, [isEstablishment, showEstablishmentField, establishments, form]);

  const adminLoad = useQuery({
    queryKey: ["product", "form", "admin", id],
    queryFn: () => fetchProductById(id!),
    enabled: isAdmin && mode === "edit" && Boolean(id),
    retry: false,
  });

  const establishmentLoad = useQuery({
    queryKey: ["product", "form", "establishment", id],
    queryFn: () => fetchEstablishmentProductById(id!),
    enabled: isEstablishment && mode === "edit" && Boolean(id),
    retry: false,
  });

  const withVariantsQuery = useQuery({
    queryKey: ["establishment-products", "with-variants", establishmentId, productSearch],
    queryFn: () =>
      fetchProductsWithVariants({
        establishmentId,
        name: productSearch || undefined,
      }),
    enabled: isEstablishment && Boolean(establishmentId),
  });

  const variantsForEdit = useQuery({
    queryKey: ["product-variants", selectedExisting?.productId, establishmentId],
    queryFn: () =>
      fetchProductVariants({
        productId: selectedExisting!.productId,
        establishmentId,
      }),
    enabled:
      Boolean(selectedExisting?.productId && establishmentId) &&
      selectedExisting?.status?.toLowerCase() === "approved",
  });

  const variationProduct =
    variantsForEdit.data ??
    (selectedExisting?.status?.toLowerCase() === "approved" ? selectedExisting : null);

  const isLoading =
    (isAdmin && mode === "edit" && adminLoad.isLoading) ||
    (isEstablishment && mode === "edit" && establishmentLoad.isLoading);

  const loadError =
    (isAdmin && mode === "edit" && adminLoad.isError) ||
    (isEstablishment && mode === "edit" && establishmentLoad.isError);

  useEffect(() => {
    if (!apiUser?.id) return;
    const stored = readProductFormAutostore(apiUser.id, mode, id);
    if (stored && mode === "create") {
      form.reset(stored);
    }
  }, [apiUser?.id, mode, id, form]);

  useEffect(() => {
    if (adminLoad.data && mode === "edit" && isAdmin) {
      form.reset(mapAdminProductToForm(adminLoad.data));
    }
  }, [adminLoad.data, mode, isAdmin, form]);

  useEffect(() => {
    if (establishmentLoad.data && mode === "edit" && isEstablishment) {
      const values = mapEstablishmentProductToForm(establishmentLoad.data);
      form.reset(values);
      setSelectedExisting({
        ...establishmentLoad.data,
        variants: [],
        productId: establishmentLoad.data.productId,
        establishmentProductId: establishmentLoad.data.establishmentProductId,
        id: establishmentLoad.data.id,
      } as EstablishmentProductWithVariants);
      setSelectedLabel(establishmentLoad.data.name);
      if (establishmentLoad.data.status?.toLowerCase() === "approved") {
        void variantsForEdit.refetch();
      }
    }
  }, [establishmentLoad.data, mode, isEstablishment, form, variantsForEdit]);

  useEffect(() => {
    if (mode !== "edit" || !establishmentLoad.data || !variantsForEdit.data) return;
    if (establishmentLoad.data.status?.toLowerCase() === "approved") {
      setSelectedExisting(variantsForEdit.data);
    }
  }, [variantsForEdit.data, establishmentLoad.data, mode]);

  const autostoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!apiUser?.id) return;
    const sub = form.watch((values) => {
      if (autostoreTimer.current) clearTimeout(autostoreTimer.current);
      autostoreTimer.current = setTimeout(() => {
        writeProductFormAutostore(apiUser.id, mode, values as ProductFormSchemaValues, id);
      }, 400);
    });
    return () => {
      sub.unsubscribe();
      if (autostoreTimer.current) clearTimeout(autostoreTimer.current);
    };
  }, [apiUser?.id, form, mode, id]);

  const coreDisabled = isCoreFieldsDisabled({
    isEstablishment,
    productStatus: selectedExisting?.status ?? form.watch("status"),
    isCreatingNew: form.watch("name").startsWith("new_"),
  });

  const showVariations =
    isEstablishment &&
    (selectedExisting?.status?.toLowerCase() === "approved" ||
      (mode === "edit" && establishmentLoad.data?.status?.toLowerCase() === "approved"));

  const showBrandsTable = !showVariations;

  const selectedExistingProductId = selectedExisting?.productId ?? null;

  const saveVariationsFirst = useCallback(async () => {
    if (!variationsRef.current?.hasChanges) return true;
    try {
      await variationsRef.current.saveVariations();
      return true;
    } catch {
      return false;
    }
  }, []);

  const { submit, isSubmitting } = useProductSubmission({
    isAdmin,
    isEstablishment,
    mode,
    selectedProductId: isAdmin ? id : selectedExistingProductId ?? undefined,
    selectedEstablishmentProductId: isEstablishment ? id : undefined,
    selectedExistingProduct: selectedExisting,
    selectedExistingProductId,
    selectedProductLabel: selectedLabel,
    onVariationsSaved: saveVariationsFirst,
  });

  const handleCancel = () => {
    if (apiUser?.id) clearProductFormAutostore(apiUser.id, mode, id);
    navigate("/products");
  };

  const hasCoreFieldChanges = useMemo(() => {
    const dirty = form.formState.dirtyFields;
    const core = ["name", "unitType", "packagingUnit", "segmentIds", "ncm", "establishmentId"];
    return core.some((field) => Boolean(dirty[field as keyof typeof dirty]));
  }, [form.formState.dirtyFields]);

  const onFormSubmit = form.handleSubmit(async (values) => {
    if (showVariations && variationsRef.current?.hasChanges) {
      const batchResult = await saveVariationsFirst();
      if (!batchResult) return;
      if (!hasCoreFieldChanges && !values.name.startsWith("new_")) {
        toast.success(t("modules.product.form.toast.variationsUpdated"));
        if (apiUser?.id) clearProductFormAutostore(apiUser.id, mode, id);
        navigate("/products");
        return;
      }
    }

    try {
      await submit(values);
      if (apiUser?.id) clearProductFormAutostore(apiUser.id, mode, id);
    } catch {
      // toast handled in hook
    }
  });

  if (role !== "admin" && role !== "establishment") {
    return <Navigate to="/404" replace />;
  }

  if (loadError) {
    return <Navigate to="/404" replace />;
  }

  if (isLoading) {
    return <ProductFormSkeleton />;
  }

  const pageTitle =
    mode === "edit"
      ? t("modules.product.form.titleEdit")
      : t("modules.product.form.titleCreate");

  return (
    <DashboardPageLayout showPageHeader={false}>
      <form className="flex flex-col gap-6" onSubmit={onFormSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="h-9 w-fit gap-2 px-2 text-muted-foreground" asChild>
            <Link to="/products">
              <ArrowLeft className="size-4" />
              {t("modules.product.list.pageTitle")}
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("modules.product.form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 text-white">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {t("modules.product.form.save")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            <ProductCoreFields
              form={form}
              isAdmin={isAdmin}
              isEstablishment={isEstablishment}
              coreDisabled={coreDisabled}
              segments={segments}
              establishments={establishments}
              showEstablishmentField={showEstablishmentField}
              establishmentProducts={withVariantsQuery.data ?? []}
              productsLoading={withVariantsQuery.isLoading}
              onProductSearch={setProductSearch}
              onSelectExistingProduct={(product) => {
                setSelectedExisting(product);
                setSelectedLabel(product?.name ?? null);
              }}
              onCreateNewProduct={(name) => {
                setSelectedExisting(null);
                setSelectedLabel(name);
                form.setValue("brands", [], { shouldDirty: true });
              }}
              selectedProductLabel={selectedLabel}
            />

            {showBrandsTable ? <ProductBrandsTable form={form} disabled={coreDisabled} /> : null}

            {showVariations ? (
              <ProductVariationsSection
                selectedProduct={variationProduct}
                establishmentId={establishmentId}
                sectionRef={variationsRef}
              />
            ) : null}
          </CardContent>
        </Card>
      </form>
    </DashboardPageLayout>
  );
}
