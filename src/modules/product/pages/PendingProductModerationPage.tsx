import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, LoaderCircle, XCircle } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { PendingProductBrandsTable } from "@/modules/product/components/PendingProductBrandsTable";
import { ProductCoreFields } from "@/modules/product/components/ProductCoreFields";
import { ProductFormSkeleton } from "@/modules/product/components/ProductFormSkeleton";
import { usePendingProductDetailQuery } from "@/modules/product/hooks/usePendingProductDetailQuery";
import { usePendingProductMutations } from "@/modules/product/hooks/usePendingProductMutations";
import { useProductListSupportQueries } from "@/modules/product/hooks/useProductListSupportQueries";
import {
  defaultProductFormValues,
  productBrandSchema,
  productFormSchema,
  type ProductFormSchemaValues,
} from "@/modules/product/lib/product-form-schema";
import {
  pendingProductListFilterParsers,
  pendingProductListFilterUrlKeys,
  toPendingProductsFetchParams,
} from "@/modules/product/lib/pending-product-list-filters";
import {
  buildBrandModerationPayload,
  buildModerationPayload,
  mapPendingProductToForm,
} from "@/modules/product/lib/pending-product-moderation-payload";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/sonner";

export function PendingProductModerationPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const role = useApiUserRole();
  const { solicitationId } = useParams<{ solicitationId: string }>();
  const [approvingBrandId, setApprovingBrandId] = useState<string | null>(null);
  const [rejectingBrandId, setRejectingBrandId] = useState<string | null>(null);

  const [listQuery] = useQueryStates(pendingProductListFilterParsers, {
    urlKeys: pendingProductListFilterUrlKeys,
  });
  const listParams = useMemo(() => toPendingProductsFetchParams(listQuery), [listQuery]);

  const detailQuery = usePendingProductDetailQuery(solicitationId, {
    enabled: role === "admin",
  });
  const { segments } = useProductListSupportQueries(role);

  const form = useForm<ProductFormSchemaValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues,
  });

  const detail = detailQuery.data;
  const productId = detail?.id ?? "";

  const mutations = usePendingProductMutations({
    productId,
    solicitationId: solicitationId ?? "",
    listParams,
    onProductModerated: () => navigate("/products/pending"),
  });

  useEffect(() => {
    if (!detail) return;
    form.reset(mapPendingProductToForm(detail));
  }, [detail, form]);

  const brands = form.watch("brands");
  const hasPendingBrands = brands.some((brand) => brand.status === "pending");
  const isApproved = detail?.status === "approved";
  const isRejected = detail?.status === "rejected";

  const getStatusLabel = () => {
    if (detail?.status === "pending") return t("modules.product.pending.status.pending");
    if (detail?.status === "rejected") return t("modules.product.pending.status.rejected");
    return t("modules.product.pending.status.approved");
  };

  const handleSave = form.handleSubmit(async (values) => {
    if (!detail) return;
    try {
      await mutations.updateMutation.mutateAsync(buildModerationPayload(values, detail));
      toast.success(t("modules.product.pending.moderation.toast.saved"));
    } catch {
      toast.error(t("modules.product.pending.moderation.toast.saveError"));
    }
  });

  const handleApproveProduct = form.handleSubmit(async (values) => {
    if (!detail || hasPendingBrands) return;
    try {
      await mutations.approveMutation.mutateAsync(buildModerationPayload(values, detail));
      toast.success(t("modules.product.pending.moderation.toast.approved"));
    } catch {
      toast.error(t("modules.product.pending.moderation.toast.approveError"));
    }
  });

  const handleRejectProduct = form.handleSubmit(async (values) => {
    if (!detail || isApproved) return;
    try {
      await mutations.rejectMutation.mutateAsync(buildModerationPayload(values, detail));
      toast.success(t("modules.product.pending.moderation.toast.rejected"));
    } catch {
      toast.error(t("modules.product.pending.moderation.toast.rejectError"));
    }
  });

  const validateBrand = (brandId: string) => {
    const targetBrand = form.getValues("brands").find((brand) => brand.id === brandId);
    if (!targetBrand) return false;
    const validation = productBrandSchema.safeParse(targetBrand);
    if (!validation.success) {
      toast.error(t("modules.product.pending.moderation.toast.brandValidationError"));
      return false;
    }
    return true;
  };

  const handleApproveBrand = async (brandId: string) => {
    if (!detail || !validateBrand(brandId)) return;
    const payload = buildBrandModerationPayload(brandId, form.getValues(), detail);
    if (!payload) return;

    setApprovingBrandId(brandId);
    try {
      await mutations.approveBrandMutation.mutateAsync({ brandId, payload });
      toast.success(t("modules.product.pending.moderation.toast.brandApproved"));
    } catch {
      toast.error(t("modules.product.pending.moderation.toast.brandApproveError"));
    } finally {
      setApprovingBrandId(null);
    }
  };

  const handleRejectBrand = async (brandId: string) => {
    if (!detail || !validateBrand(brandId)) return;
    const payload = buildBrandModerationPayload(brandId, form.getValues(), detail);
    if (!payload) return;

    setRejectingBrandId(brandId);
    try {
      await mutations.rejectBrandMutation.mutateAsync({ brandId, payload });
      toast.success(t("modules.product.pending.moderation.toast.brandRejected"));
    } catch {
      toast.error(t("modules.product.pending.moderation.toast.brandRejectError"));
    } finally {
      setRejectingBrandId(null);
    }
  };

  if (role !== "admin") return <Navigate to="/404" replace />;
  if (detailQuery.isError) return <Navigate to="/404" replace />;
  if (detailQuery.isLoading || !detail) return <ProductFormSkeleton />;

  return (
    <DashboardPageLayout showPageHeader={false}>
      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="h-9 w-fit gap-2 px-2 text-muted-foreground" asChild>
            <Link to="/products/pending">
              <ArrowLeft className="size-4" />
              {t("modules.product.pending.list.pageTitle")}
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutations.isSaving}
              onClick={() => void handleSave()}
            >
              {t("modules.product.form.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={mutations.isSaving || isApproved || isRejected}
              onClick={() => void handleRejectProduct()}
            >
              <XCircle className="size-4" />
              {t("modules.product.pending.moderation.rejectProduct")}
            </Button>
            <Button
              type="button"
              className="gap-2 text-white"
              disabled={mutations.isSaving || isApproved || hasPendingBrands}
              onClick={() => void handleApproveProduct()}
            >
              {mutations.isSaving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CheckCircle className="size-4" />
              )}
              {t("modules.product.pending.moderation.approveProduct")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              {t("modules.product.pending.moderation.title")}
              <Badge variant={detail.status === "pending" ? "secondary" : "default"}>
                {getStatusLabel()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            {hasPendingBrands ? (
              <Alert>
                <AlertDescription>
                  {t("modules.product.pending.moderation.pendingBrandsWarning")}
                </AlertDescription>
              </Alert>
            ) : null}

            {detail.solicitorEstablishment ? (
              <div className="flex flex-col gap-2 md:max-w-md">
                <Label>{t("modules.product.pending.moderation.solicitorEstablishment")}</Label>
                <p className="text-sm text-muted-foreground">
                  {detail.solicitorEstablishment.name}
                </p>
              </div>
            ) : null}

            <ProductCoreFields
              form={form}
              isAdmin
              isEstablishment={false}
              coreDisabled={false}
              segments={segments}
              establishments={[]}
              showEstablishmentField={false}
              establishmentProducts={[]}
              productsLoading={false}
              onProductSearch={() => {}}
              onSelectExistingProduct={() => {}}
              onCreateNewProduct={() => {}}
            />

            <PendingProductBrandsTable
              form={form}
              onApproveBrand={(brandId) => void handleApproveBrand(brandId)}
              onRejectBrand={(brandId) => void handleRejectBrand(brandId)}
              approvingBrandId={approvingBrandId}
              rejectingBrandId={rejectingBrandId}
            />
          </CardContent>
        </Card>
      </form>
    </DashboardPageLayout>
  );
}
