import { ArrowLeft } from "lucide-react";
import { useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchProductVariants } from "@/modules/product/api/establishment-products-api";
import {
  ProductVariationsSection,
  type ProductVariationsSectionHandle,
} from "@/modules/product/components/ProductVariationsSection";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "@/shared/ui/sonner";

type ManageBrandsLocationState = {
  productId?: string;
  establishmentId?: string;
  productName?: string;
  returnTo?: string;
};

export function ManageProductBrandsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { establishmentId: establishmentIdParam } = useParams<{
    establishmentId: string;
  }>();
  const location = useLocation();
  const state = (location.state ?? {}) as ManageBrandsLocationState;
  const variationsRef = useRef<ProductVariationsSectionHandle | null>(null);

  const establishmentId = state.establishmentId ?? establishmentIdParam ?? "";
  const productId = state.productId ?? "";

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product-variants", "manage", productId, establishmentId],
    queryFn: () => fetchProductVariants({ productId, establishmentId }),
    enabled: Boolean(productId && establishmentId),
    retry: false,
  });

  const handleSave = async () => {
    if (!variationsRef.current?.hasChanges) {
      if (state.returnTo) navigate(state.returnTo);
      else navigate(-1);
      return;
    }
    try {
      await variationsRef.current.saveVariations();
      toast.success(t("modules.product.form.toast.variationsUpdated"));
      if (state.returnTo) {
        navigate(state.returnTo);
      } else {
        navigate(-1);
      }
    } catch {
      toast.error(t("modules.product.form.toast.saveError"));
    }
  };

  if (!establishmentId || (!productId && !isLoading)) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <p className="text-muted-foreground">{t("modules.product.manageBrands.missingState")}</p>
        <Button variant="link" asChild>
          <Link to="/products">{t("modules.product.list.pageTitle")}</Link>
        </Button>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout showPageHeader={false}>
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="h-9 w-fit gap-2 px-2 text-muted-foreground" asChild>
          <Link to={state.returnTo ?? "/admin/restaurants"}>
            <ArrowLeft className="size-4" />
            {t("modules.product.manageBrands.back")}
          </Link>
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {t("modules.product.manageBrands.title", {
                name: state.productName ?? product?.name ?? "",
              })}
            </CardTitle>
            <Button type="button" className="text-white" onClick={() => void handleSave()}>
              {t("modules.product.form.save")}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : isError || !product ? (
              <p className="text-destructive">{t("modules.product.manageBrands.loadError")}</p>
            ) : (
              <ProductVariationsSection
                selectedProduct={product}
                establishmentId={establishmentId}
                sectionRef={variationsRef}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
