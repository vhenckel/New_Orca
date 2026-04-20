import { ArrowLeft, Layers, Package, Pencil, Tags } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getProductDetail } from "@/modules/quotation/data/productMocks";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { toast } from "@/shared/ui/sonner";
import { useI18n } from "@/shared/i18n/useI18n";

export function ProductDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const detail = getProductDetail(id);
  const product = detail?.list;

  if (!detail || !product) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <div className="flex flex-col gap-4">
          <Button variant="ghost" className="h-9 w-fit gap-2 px-2 text-muted-foreground" asChild>
            <Link to="/products">
              <ArrowLeft className="size-4" />
              {t("modules.quotation.products.list.pageTitle")}
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertTitle>{t("modules.quotation.products.detail.notFoundTitle")}</AlertTitle>
            <AlertDescription className="flex flex-col gap-4 pt-2">
              <p>{t("modules.quotation.products.detail.notFound")}</p>
              <Button asChild variant="outline" className="w-fit">
                <Link to="/products">{t("modules.quotation.products.detail.backToList")}</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardPageLayout>
    );
  }

  const { brands, internalId } = detail;
  const brandCount = brands.length;
  const segmentCount = product.segments.length;

  const onEdit = () => {
    toast.success(t("modules.quotation.products.detail.toastEdit"));
  };

  return (
    <DashboardPageLayout showPageHeader={false}>
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/products">{t("modules.quotation.products.list.pageTitle")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,280px)] truncate">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  <Package className="size-7" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {t("modules.quotation.products.detail.metaUnit", { unit: product.unit })}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      {t("modules.quotation.products.detail.metaBrands", { count: brandCount })}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      {t("modules.quotation.products.detail.metaSegments", { count: segmentCount })}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="outline" className="gap-2" asChild>
                  <Link to="/products">
                    <ArrowLeft className="size-4" />
                    {t("modules.quotation.products.detail.back")}
                  </Link>
                </Button>
                <Button type="button" className="gap-2" onClick={onEdit}>
                  <Pencil className="size-4" />
                  {t("modules.quotation.products.detail.edit")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tags className="size-4 text-muted-foreground" aria-hidden />
                {t("modules.quotation.products.detail.brandsTitle")}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {t("modules.quotation.products.detail.brandsTotal", { count: brandCount })}
              </span>
            </CardHeader>
            <CardContent className="pt-0">
              {brands.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("modules.quotation.products.detail.brandsEmpty")}</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {brands.map((b, i) => (
                    <li key={b.id} className="flex items-center gap-3 py-3 first:pt-0">
                      <span className="w-5 shrink-0 tabular-nums text-sm text-muted-foreground">{i + 1}</span>
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-sky-100 text-sm font-medium text-sky-900 dark:bg-sky-950 dark:text-sky-100">
                          {b.initial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 font-medium text-foreground">{b.name}</span>
                      {b.isActive ? (
                        <Badge className="shrink-0 border-emerald-200 bg-emerald-50 font-medium text-emerald-900 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
                          {t("modules.quotation.products.detail.brandStatus.active")}
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="size-4 text-muted-foreground" aria-hidden />
                {t("modules.quotation.products.detail.segmentsTitle")}
              </CardTitle>
              <Badge variant="secondary" className="tabular-nums">
                {segmentCount}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-0">
              <div className="flex flex-wrap gap-2">
                {product.segments.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <Separator />
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  {t("modules.quotation.products.detail.summaryTitle")}
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{t("modules.quotation.products.detail.summaryBaseUnit")}</span>
                    <span className="font-semibold tabular-nums text-foreground">{product.unit}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("modules.quotation.products.detail.summaryInternalId")}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">{internalId}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
