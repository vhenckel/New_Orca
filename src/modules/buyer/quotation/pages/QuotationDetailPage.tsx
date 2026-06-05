import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  FileText,
  Mail,
  MessageSquare,
  Package,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { sendBudget } from "@/modules/buyer/quotation/api/budgets-api";
import { ViewBudgetGenerateOrderDialog } from "@/modules/buyer/quotation/components/ViewBudgetGenerateOrderDialog";
import { ViewBudgetProductQuotationDialog } from "@/modules/buyer/quotation/components/ViewBudgetProductQuotationDialog";
import {
  useFinalizeBudget,
  useSelectCheapestQuotations,
  useViewBudget,
} from "@/modules/buyer/quotation/hooks/useViewBudget";
import {
  calcResponseProgress,
  formatViewBudgetCurrency,
  formatViewBudgetDateTime,
  formatViewBudgetPackaging,
  formatViewBudgetProductBrands,
  formatViewBudgetText,
  sumProductQuantities,
} from "@/modules/buyer/quotation/lib/view-budget-display";
import type { BudgetStatus } from "@/modules/buyer/quotation/types/budget";
import type { BudgetViewProduct } from "@/modules/buyer/quotation/types/view-budget";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { ApiError } from "@/shared/api/http-client";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { DESTRUCTIVE_BADGE, quotationBadgeClass } from "@/shared/lib/status-tones";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "@/shared/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { useMutation } from "@tanstack/react-query";

function budgetStatusBadgeClass(status: BudgetStatus): string {
  if (status === "open") return quotationBadgeClass("info");
  if (status === "finished") return quotationBadgeClass("success");
  if (status === "canceled") return DESTRUCTIVE_BADGE;
  return "border-border bg-muted text-muted-foreground";
}

function budgetStatusLabelKey(status: BudgetStatus): string {
  if (status === "open") return "modules.quotation.quotations.status.open";
  if (status === "finished") return "modules.quotation.quotations.status.finished";
  if (status === "canceled") return "modules.quotation.quotations.status.canceled";
  return "modules.quotation.quotations.status.saved";
}

function resolveBudgetTitle(
  name: string | undefined,
  establishmentName: string,
  fallback: string,
): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return establishmentName || fallback;
}

export function QuotationDetailPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useApiUserRole();
  const [activeTab, setActiveTab] = useState("general");
  const [selectedProduct, setSelectedProduct] = useState<BudgetViewProduct | null>(null);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [generateOrderDialogOpen, setGenerateOrderDialogOpen] = useState(false);

  const { budget, summary, products, suppliers, isLoading, isError } = useViewBudget(id);
  const finalizeMutation = useFinalizeBudget(id ?? "");
  const cheapestMutation = useSelectCheapestQuotations(id ?? "");

  const resendMutation = useMutation({
    mutationFn: () => sendBudget(id!),
    onSuccess: () => {
      toast.success(t("modules.quotation.detail.toast.resendSuccess"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modules.quotation.detail.toast.resendError");
      toast.error(message);
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(t("modules.quotation.detail.toast.loadError"));
    }
  }, [isError, t]);

  useEffect(() => {
    if (!budget || !id) return;
    if (budget.status === "saved") {
      navigate(`/quotations/new?edit=${id}`, { replace: true });
    }
  }, [budget, id, navigate]);

  const anyBrandLabel = t("modules.quotation.quotations.create.anyBrand");
  const isEstablishment = role === "establishment";
  const status = budget?.status;
  const canFinalize = status === "open" && isEstablishment;
  const canSelectCheapest = status === "finished";
  const showResend = status === "open";

  const title = resolveBudgetTitle(
    budget?.name,
    budget?.establishment.name ?? "",
    t("modules.quotation.detail.defaultTitle"),
  );

  const createdLabel = formatViewBudgetDateTime(budget?.createdAt);
  const deadlineLabel = formatViewBudgetDateTime(budget?.deadline);
  const metaCreatedDeadline =
    createdLabel !== "—"
      ? t("modules.quotation.detail.header.metaCreated", {
          created: createdLabel,
          deadline: deadlineLabel,
        })
      : t("modules.quotation.detail.header.metaDeadlineOnly", { deadline: deadlineLabel });

  const totalSuppliers = suppliers.length;
  const responseProgress = useMemo(
    () => calcResponseProgress(summary?.responseCount ?? 0, totalSuppliers),
    [summary?.responseCount, totalSuppliers],
  );

  const totalUnits = useMemo(() => sumProductQuantities(products), [products]);
  const hasDifferentFromRequest = products.some(
    (p) => p.hasDifferentFromRequest || p.differentFromRequest,
  );
  const maxMissingValue = useMemo(
    () => Math.max(0, ...products.map((p) => p.missingValue ?? 0)),
    [products],
  );

  const openProductDialog = (product: BudgetViewProduct) => {
    setSelectedProduct(product);
    setQuotationDialogOpen(true);
  };

  const onFinalize = () => {
    finalizeMutation.mutate(undefined, {
      onSuccess: () => toast.success(t("modules.quotation.detail.toast.finishSuccess")),
      onError: (error: unknown) => {
        const message =
          error instanceof ApiError
            ? error.message
            : t("modules.quotation.detail.toast.finishError");
        toast.error(message);
      },
    });
  };

  const onSelectCheapest = () => {
    cheapestMutation.mutate(undefined, {
      onSuccess: () => toast.success(t("modules.quotation.detail.toast.cheapestSuccess")),
      onError: (error: unknown) => {
        const message =
          error instanceof ApiError
            ? error.message
            : t("modules.quotation.detail.toast.cheapestError");
        toast.error(message);
      },
    });
  };

  if (!id) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <Alert variant="destructive">
          <AlertDescription>{t("modules.quotation.detail.notFound")}</AlertDescription>
        </Alert>
      </DashboardPageLayout>
    );
  }

  if (!isLoading && isError && !budget) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <div className="flex flex-col gap-4">
          <Button variant="ghost" className="h-9 w-fit gap-2 px-2 text-muted-foreground" asChild>
            <Link to="/quotations">
              <ArrowLeft className="size-4" />
              {t("modules.quotation.detail.backToList")}
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertDescription>{t("modules.quotation.detail.notFound")}</AlertDescription>
          </Alert>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout showPageHeader={false}>
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/quotations">{t("modules.quotation.detail.breadcrumbPrefix")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t("modules.quotation.detail.breadcrumbView", { id: id.slice(0, 8) })}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <CardContent className="flex flex-col gap-0 p-0">
            <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
                  <FileText className="size-6" />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {isLoading ? (
                      <Skeleton className="h-7 w-64" />
                    ) : (
                      <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                    )}
                    {status ? (
                      <Badge variant="outline" className={budgetStatusBadgeClass(status)}>
                        {t(budgetStatusLabelKey(status))}
                      </Badge>
                    ) : null}
                    <span className="font-mono text-sm text-muted-foreground">#{id.slice(0, 8)}</span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-80" />
                  ) : (
                    <p className="text-sm text-muted-foreground">{metaCreatedDeadline}</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="ghost" className="gap-2" asChild>
                  <Link to="/quotations">
                    <ArrowLeft className="size-4" />
                    {t("modules.quotation.detail.back")}
                  </Link>
                </Button>
                {showResend ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2"
                    disabled={resendMutation.isPending}
                    onClick={() => resendMutation.mutate()}
                  >
                    <Mail className="size-4" />
                    {t("modules.quotation.detail.resendInvites")}
                  </Button>
                ) : null}
                {canFinalize ? (
                  <Button
                    type="button"
                    className="gap-2 text-white"
                    disabled={finalizeMutation.isPending}
                    onClick={onFinalize}
                  >
                    {t("modules.quotation.detail.finishQuotation")}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="border-t px-6">
                <TabsList className="h-auto w-full justify-start rounded-none border-0 bg-transparent p-0">
                  <TabsTrigger
                    value="general"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    {t("modules.quotation.detail.tabs.general")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="suppliers"
                    className="gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    {t("modules.quotation.detail.tabs.suppliers")}
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 tabular-nums">
                      {totalSuppliers}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
            </div>
          </CardContent>
        </Card>

          <TabsContent value="general" className="mt-0 flex flex-col gap-6">
            {status === "open" ? (
              <Alert className="border-info/30 bg-info/10">
                <AlertDescription className="text-info">
                  {t("modules.quotation.detail.alert.openReadOnly")}
                </AlertDescription>
              </Alert>
            ) : null}

            {status === "finished" && maxMissingValue > 0 ? (
              <Alert className="border-warning/30 bg-warning/10">
                <AlertTriangle className="text-warning" />
                <AlertDescription>
                  {t("modules.quotation.detail.alert.minimumOrder", {
                    amount: formatViewBudgetCurrency(maxMissingValue),
                  })}
                </AlertDescription>
              </Alert>
            ) : null}

            {hasDifferentFromRequest ? (
              <Alert className="border-warning/30 bg-warning/10">
                <AlertTriangle className="text-warning" />
                <AlertDescription>
                  {t("modules.quotation.detail.alert.differentBrand")}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <CalendarClock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      {t("modules.quotation.detail.meta.deadline")}
                    </span>
                    <span className="font-medium">{deadlineLabel}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <Truck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      {t("modules.quotation.detail.meta.deliveryTime")}
                    </span>
                    <span className="font-medium">
                      {formatViewBudgetText(budget?.deliveryTime)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <MessageSquare className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      {t("modules.quotation.detail.meta.observation")}
                    </span>
                    <span className="font-medium">{formatViewBudgetText(budget?.observation)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>{t("modules.quotation.detail.orderSummary.title")}</CardTitle>
                  <CardDescription>
                    {t("modules.quotation.detail.orderSummary.subtitle")}
                  </CardDescription>
                </div>
                <div className="flex w-full min-w-[200px] flex-col gap-2 sm:w-56">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("modules.quotation.detail.orderSummary.responsesProgress", {
                        fraction: responseProgress.fraction,
                      })}
                    </span>
                    <span className="font-medium tabular-nums">{responseProgress.percent}%</span>
                  </div>
                  <Progress value={responseProgress.percent} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                  <SummaryMetric
                    label={t("modules.quotation.detail.orderSummary.responses")}
                    value={String(summary?.responseCount ?? 0)}
                    loading={isLoading}
                  />
                  <SummaryMetric
                    label={t("modules.quotation.detail.orderSummary.quotedItems")}
                    value={String(products.length)}
                    loading={isLoading}
                  />
                  <SummaryMetric
                    label={t("modules.quotation.detail.orderSummary.orderTotal")}
                    value={formatViewBudgetCurrency(summary?.orderTotal)}
                    loading={isLoading}
                  />
                  <SummaryMetric
                    label={t("modules.quotation.detail.orderSummary.cheaperTotal")}
                    value={formatViewBudgetCurrency(summary?.cheaperTotal)}
                    loading={isLoading}
                    valueClassName="text-success"
                  />
                  <SummaryMetric
                    label={t("modules.quotation.detail.orderSummary.totalDifference")}
                    value={formatViewBudgetCurrency(summary?.totalDifference)}
                    loading={isLoading}
                    valueClassName="text-warning"
                  />
                  <SummaryMetric
                    label={t("modules.quotation.detail.orderSummary.mostExpensiveTotal")}
                    value={formatViewBudgetCurrency(summary?.mostExpensiveTotal)}
                    loading={isLoading}
                  />
                  <SummaryMetric
                    label={t("modules.quotation.detail.orderSummary.totalSavings")}
                    value={formatViewBudgetCurrency(summary?.totalSavings)}
                    loading={isLoading}
                    valueClassName="text-success"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <CardTitle>{t("modules.quotation.detail.products.title")}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {canSelectCheapest ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={cheapestMutation.isPending}
                      onClick={onSelectCheapest}
                    >
                      {t("modules.quotation.detail.selectCheapest")}
                    </Button>
                  ) : null}
                  <Badge variant="secondary" className="tabular-nums">
                    {t("modules.quotation.detail.products.badge", {
                      items: products.length,
                      units: totalUnits,
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-6 pt-0">
                <div className="overflow-x-auto px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead className="min-w-[160px]">
                          {t("modules.quotation.detail.products.table.product")}
                        </TableHead>
                        <TableHead>{t("modules.quotation.detail.products.table.brand")}</TableHead>
                        <TableHead>{t("modules.quotation.detail.products.table.packaging")}</TableHead>
                        <TableHead className="text-right">
                          {t("modules.quotation.detail.products.table.qty")}
                        </TableHead>
                        <TableHead>{t("modules.quotation.detail.products.table.supplier")}</TableHead>
                        <TableHead className="text-right">
                          {t("modules.quotation.detail.products.table.price")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("modules.quotation.detail.products.table.total")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("modules.quotation.detail.products.table.cheapest")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("modules.quotation.detail.products.table.diff")}
                        </TableHead>
                        <TableHead>{t("modules.quotation.detail.products.table.payment")}</TableHead>
                        <TableHead>{t("modules.quotation.detail.products.table.delivery")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 12 }).map((__, j) => (
                                <TableCell key={j}>
                                  <Skeleton className="h-4 w-full" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        : products.map((row, index) => (
                            <TableRow
                              key={row.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => openProductDialog(row)}
                            >
                              <TableCell className="tabular-nums text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {row.missingValue > 0 ? (
                                    <AlertTriangle
                                      className="size-4 shrink-0 text-warning"
                                      title={t("modules.quotation.detail.products.minimumOrderHint")}
                                    />
                                  ) : null}
                                  {row.differentFromRequest ? (
                                    <AlertTriangle
                                      className="size-4 shrink-0 text-warning"
                                      title={t("modules.quotation.detail.products.differentBrandHint")}
                                    />
                                  ) : null}
                                  <span className="font-medium">{row.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatViewBudgetProductBrands(row, anyBrandLabel)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatViewBudgetPackaging(row.packagingUnit)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                              <TableCell>{formatViewBudgetText(row.supplier)}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatViewBudgetCurrency(row.unitValue)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium">
                                {formatViewBudgetCurrency(row.totalValue)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-success">
                                {formatViewBudgetCurrency(row.lowestValue)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-warning">
                                {formatViewBudgetCurrency(row.differenceValue)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatViewBudgetText(row.paymentTerm)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatViewBudgetText(row.deliveryDeadline)}
                              </TableCell>
                            </TableRow>
                          ))}
                      {!isLoading && products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="py-10 text-center text-muted-foreground">
                            {t("modules.quotation.detail.products.empty")}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.company")}</TableHead>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.representative")}</TableHead>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.phone")}</TableHead>
                        <TableHead className="text-right">
                          {t("modules.quotation.detail.suppliers.table.minimumOrder")}
                        </TableHead>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.responseDate")}</TableHead>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.observation")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 7 }).map((__, j) => (
                                <TableCell key={j}>
                                  <Skeleton className="h-4 w-full" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        : suppliers.map((row, index) => (
                            <TableRow key={row.id}>
                              <TableCell className="tabular-nums text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              <TableCell className="font-medium">{row.name}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span>{row.responsible.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {row.responsible.email}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{row.phone}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatViewBudgetCurrency(row.minimumOrderValue)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {row.responseDate
                                  ? formatViewBudgetDateTime(row.responseDate)
                                  : t("modules.quotation.detail.suppliers.noQuotations")}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                {formatViewBudgetText(row.observation)}
                              </TableCell>
                            </TableRow>
                          ))}
                      {!isLoading && suppliers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                            {t("modules.quotation.detail.suppliers.empty")}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/quotations">
              <X className="size-4" />
              {t("modules.quotation.detail.close")}
            </Link>
          </Button>
          {canFinalize ? (
            <Button
              type="button"
              className="gap-2 text-white"
              disabled={finalizeMutation.isPending}
              onClick={onFinalize}
            >
              {t("modules.quotation.detail.finishQuotation")}
            </Button>
          ) : null}
          {status === "finished" ? (
            <Button
              type="button"
              className="gap-2 text-white"
              onClick={() => setGenerateOrderDialogOpen(true)}
            >
              <Package className="size-4" />
              {t("modules.quotation.detail.generateOrder")}
            </Button>
          ) : null}
        </div>
        </Tabs>
      </div>

      <ViewBudgetProductQuotationDialog
        open={quotationDialogOpen}
        onOpenChange={setQuotationDialogOpen}
        budgetId={id}
        product={selectedProduct}
        budgetStatus={status}
      />

      <ViewBudgetGenerateOrderDialog
        open={generateOrderDialogOpen}
        onOpenChange={setGenerateOrderDialogOpen}
        budgetId={id}
        products={products}
        buyerName={budget?.establishment.name}
        deliveryTime={budget?.deliveryTime}
        deadlineIso={budget?.deadline}
        budgetObservation={budget?.observation ?? undefined}
      />
    </DashboardPageLayout>
  );
}

function SummaryMetric({
  label,
  value,
  loading,
  valueClassName,
}: {
  label: string;
  value: string;
  loading?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <span className={cn("text-lg font-semibold tabular-nums", valueClassName)}>{value}</span>
      )}
    </div>
  );
}
