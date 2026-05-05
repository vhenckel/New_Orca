import {
  AlertTriangle,
  ArrowLeft,
  Box,
  CheckCircle2,
  Clock,
  FileText,
  ListChecks,
  Sparkles,
  TrendingDown,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getQuotationDetail } from "@/modules/buyer/quotation/data/quotationDetailMocks";
import type { QuotationDetailSupplier, QuotationSupplierResponse } from "@/modules/buyer/quotation/types";
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
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useI18n } from "@/shared/i18n/useI18n";
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

function formatDateTime(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleString(locale === "en-US" ? "en-US" : "pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: QuotationSupplierResponse) {
  if (status === "answered") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "partial") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-border bg-muted text-muted-foreground";
}

export function QuotationDetailPage() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const detail = getQuotationDetail(id, locale);

  if (!detail) {
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
            <AlertTitle>{t("modules.quotation.detail.notFoundTitle")}</AlertTitle>
            <AlertDescription className="flex flex-col gap-4 pt-2">
              <p>{t("modules.quotation.detail.notFound")}</p>
              <Button asChild variant="outline" className="w-fit">
                <Link to="/quotations">{t("modules.quotation.detail.backToList")}</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardPageLayout>
    );
  }

  const onFinish = () => {
    toast.success(t("modules.quotation.detail.toastFinish"));
  };

  const createdLabel = formatDateTime(detail.createdAt, locale);
  const deadlineLabel = formatDateTime(detail.deadlineAt, locale);

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
              <BreadcrumbPage className="font-mono">#{detail.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <FileText className="size-6" />
                </div>
                <div className="min-w-0 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">{detail.title}</h2>
                    <Badge
                      variant="outline"
                      className="border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200"
                    >
                      {t(`modules.quotation.quotations.status.${detail.status}`)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <p>{t("modules.quotation.detail.summary.created", { date: createdLabel })}</p>
                    <p>{t("modules.quotation.detail.summary.deadline", { date: deadlineLabel })}</p>
                  </div>
                  <p className="text-sm text-foreground">{detail.note}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/quotations">
                    <ArrowLeft className="size-4" />
                    {t("modules.quotation.detail.back")}
                  </Link>
                </Button>
                <Button type="button" className="gap-2 text-white" onClick={onFinish}>
                  <ListChecks className="size-4" />
                  {t("modules.quotation.detail.finishBudget")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("modules.quotation.detail.stats.responses")}
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold tabular-nums">{detail.responsesFraction}</p>
              <p className="text-xs text-muted-foreground">{detail.responsesSuppliersHint}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("modules.quotation.detail.stats.items")}
              </CardTitle>
              <Box className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">{detail.itemCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("modules.quotation.detail.stats.bestTotal")}
              </CardTitle>
              <TrendingDown className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {detail.bestTotalFormatted}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("modules.quotation.detail.stats.gap")}
              </CardTitle>
              <AlertTriangle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {detail.gapFormatted}
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("modules.quotation.detail.stats.savings")}
              </CardTitle>
              <Sparkles className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {detail.savingsVsHighestFormatted}
              </p>
              <p className="text-xs text-muted-foreground">{t("modules.quotation.detail.stats.vsHighest")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">{t("modules.quotation.detail.deadlines.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">{t("modules.quotation.detail.deadlines.limit")}</span>
                <span className="font-medium">{deadlineLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">{t("modules.quotation.detail.deadlines.delivery")}</span>
                <span className="font-medium">{detail.deliveryTerms}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">{t("modules.quotation.detail.deadlines.responseStatus")}</span>
                <span className="font-medium">{detail.responseProgressLabel}</span>
              </div>
            </CardContent>
          </Card>

          <Alert className="w-full border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
            <AlertTriangle className="text-amber-600 dark:text-amber-400" />
            <AlertTitle>{t("modules.quotation.detail.attention.title")}</AlertTitle>
            <AlertDescription>{t("modules.quotation.detail.attention.body", { amount: detail.gapFormatted })}</AlertDescription>
          </Alert>
        </div>

        <Card className="min-w-0">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t("modules.quotation.detail.compare.title")}</CardTitle>
              <CardDescription>{t("modules.quotation.detail.compare.subtitle")}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="w-fit shrink-0 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
            >
              {detail.opportunitiesFormatted}
            </Badge>
          </CardHeader>
          <CardContent className="px-0 pb-6 pt-0">
            <div className="overflow-x-auto px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">{t("modules.quotation.detail.compare.table.product")}</TableHead>
                    <TableHead>{t("modules.quotation.detail.compare.table.brand")}</TableHead>
                    <TableHead>{t("modules.quotation.detail.compare.table.qty")}</TableHead>
                    <TableHead className="min-w-[160px]">{t("modules.quotation.detail.compare.table.chosenSupplier")}</TableHead>
                    <TableHead className="text-right">{t("modules.quotation.detail.compare.table.total")}</TableHead>
                    <TableHead className="text-right">{t("modules.quotation.detail.compare.table.bestTotal")}</TableHead>
                    <TableHead>{t("modules.quotation.detail.compare.table.diff")}</TableHead>
                    <TableHead>{t("modules.quotation.detail.compare.table.delivery")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.lines.map((line) => (
                    <TableRow key={line.productName}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {line.lineStatus === "best" ? (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          )}
                          <span className="font-medium">{line.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{line.brandsLabel}</TableCell>
                      <TableCell className="tabular-nums">{line.quantityLabel}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{line.chosenSupplier}</span>
                          {line.bestSupplierName ? (
                            <span className="text-xs text-muted-foreground">
                              {t("modules.quotation.detail.compare.bestHint", { name: line.bestSupplierName })}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{line.totalFormatted}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                        {line.bestTotalFormatted}
                      </TableCell>
                      <TableCell>
                        {line.diff === "best" ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
                          >
                            {t("modules.quotation.detail.compare.badgeBest")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
                          >
                            {line.diff.savingsFormatted}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{line.deliveryLabel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="suppliers" className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="suppliers">{t("modules.quotation.detail.tabs.suppliers")}</TabsTrigger>
            <TabsTrigger value="finance">{t("modules.quotation.detail.tabs.finance")}</TabsTrigger>
          </TabsList>
          <TabsContent value="suppliers" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.supplier")}</TableHead>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.response")}</TableHead>
                        <TableHead>{t("modules.quotation.detail.suppliers.table.time")}</TableHead>
                        <TableHead className="text-right">{t("modules.quotation.detail.suppliers.table.total")}</TableHead>
                        <TableHead className="text-right">
                          {t("modules.quotation.detail.suppliers.table.competitiveness")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.suppliers.map((row: QuotationDetailSupplier) => (
                        <TableRow key={row.name}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadgeClass(row.response)}>
                              {t(`modules.quotation.detail.suppliers.status.${row.response}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">{row.responseTimeLabel}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{row.totalFormatted}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {row.competitivenessLabel}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="finance" className="mt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{t("modules.quotation.detail.finance.chosen")}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">{detail.financeChosenFormatted}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{t("modules.quotation.detail.finance.best")}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums text-emerald-600 dark:text-emerald-400">
                    {detail.financeBestFormatted}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{t("modules.quotation.detail.finance.worst")}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums text-amber-600 dark:text-amber-400">
                    {detail.financeWorstFormatted}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
