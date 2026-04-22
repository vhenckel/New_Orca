import {
  ArrowLeft,
  Building2,
  Clock,
  LineChart,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  Phone,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getSupplierDetail } from "@/modules/supplier/data/supplierMocks";
import type { SupplierRecentQuotationStatus } from "@/modules/supplier/types";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { toast } from "@/shared/ui/sonner";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

function formatCurrencyBrl(value: number, locale: string): string {
  return value.toLocaleString(locale === "en-US" ? "en-US" : "pt-BR", { style: "currency", currency: "BRL" });
}

function formatResponseKpi(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function GradientIndicatorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-semibold text-foreground">{pct}%</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted/80"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-orange-400 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RecentQuotationStatusBadge({ status }: { status: SupplierRecentQuotationStatus }) {
  const { t } = useI18n();
  if (status === "answered") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 font-medium text-emerald-900 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
      >
        {t("modules.supplier.detail.recent.status.answered")}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="font-medium">
      {t("modules.supplier.detail.recent.status.expired")}
    </Badge>
  );
}

export function SupplierDetailPage() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const detail = getSupplierDetail(id);
  const { list: supplier } = detail ?? {};

  if (!detail || !supplier) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <div className="flex flex-col gap-4">
          <Button variant="ghost" className="h-9 w-fit gap-2 px-2 text-muted-foreground" asChild>
            <Link to="/suppliers">
              <ArrowLeft className="size-4" />
              {t("modules.supplier.detail.backCrumb")}
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertTitle>{t("modules.supplier.detail.notFoundTitle")}</AlertTitle>
            <AlertDescription className="flex flex-col gap-4 pt-2">
              <p>{t("modules.supplier.detail.notFound")}</p>
              <Button asChild variant="outline" className="w-fit">
                <Link to="/suppliers">{t("modules.supplier.detail.backToList")}</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardPageLayout>
    );
  }

  const {
    isActive,
    lastQuoteDaysAgo,
    contact,
    locations,
    quotationsCount,
    winRatePercent,
    segments,
    recentQuotations,
    performance,
  } = detail;

  const metaLine = t("modules.supplier.detail.metaLine", {
    days: lastQuoteDaysAgo,
    count: locations.length,
  });

  const onMessage = () => {
    toast(t("modules.supplier.detail.toastMessage"));
  };

  const onEdit = () => {
    toast.success(t("modules.supplier.detail.toastEdit"));
  };

  const kpi = [
    {
      key: "rating",
      label: t("modules.supplier.detail.kpi.rating"),
      value: `${supplier.rating.toFixed(1)}/5`,
      icon: Star,
      iconClass: "text-amber-500",
    },
    {
      key: "response",
      label: t("modules.supplier.detail.kpi.avgResponse"),
      value: formatResponseKpi(supplier.responseTimeMinutes),
      icon: Clock,
      iconClass: "text-sky-600",
    },
    {
      key: "quotes",
      label: t("modules.supplier.detail.kpi.quotations"),
      value: String(quotationsCount),
      icon: Package,
      iconClass: "text-violet-600",
    },
    {
      key: "win",
      label: t("modules.supplier.detail.kpi.winRate"),
      value: `${winRatePercent}%`,
      icon: LineChart,
      iconClass: "text-emerald-600",
    },
  ] as const;

  const contactRows = [
    {
      key: "rep",
      label: t("modules.supplier.detail.contact.representative"),
      value: contact.representative,
      icon: User,
    },
    {
      key: "phone",
      label: t("modules.supplier.detail.contact.phone"),
      value: contact.phone,
      icon: Phone,
    },
    {
      key: "mail",
      label: t("modules.supplier.detail.contact.email"),
      value: contact.email,
      icon: Mail,
    },
    {
      key: "min",
      label: t("modules.supplier.detail.contact.minOrder"),
      value: formatCurrencyBrl(supplier.minOrderBrl, locale),
      icon: Wallet,
    },
  ];

  return (
    <DashboardPageLayout showPageHeader={false}>
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="h-9 w-fit gap-2 px-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/suppliers">
            <ArrowLeft className="size-4" />
            {t("modules.supplier.detail.backCrumb")}
          </Link>
        </Button>

        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  <Building2 className="size-7" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">{supplier.name}</h1>
                    {isActive ? (
                      <Badge className="gap-1.5 border-emerald-200 bg-emerald-50 font-medium text-emerald-900 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
                        <span className="text-[10px] leading-none text-emerald-600 dark:text-emerald-400" aria-hidden>
                          ●
                        </span>
                        {t("modules.supplier.detail.status.active")}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{metaLine}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="outline" className="gap-2" onClick={onMessage}>
                  <MessageSquare className="size-4" />
                  {t("modules.supplier.detail.message")}
                </Button>
                <Button type="button" className="gap-2" onClick={onEdit}>
                  <Pencil className="size-4" />
                  {t("modules.supplier.detail.edit")}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {kpi.map(({ key, label, value, icon: Icon, iconClass }) => (
                <div
                  key={key}
                  className="flex flex-col gap-1 rounded-xl border border-border/80 bg-muted/30 px-3 py-3"
                >
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Icon className={cn("size-3.5 shrink-0", iconClass)} aria-hidden />
                    {label}
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("modules.supplier.detail.contact.title")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-0">
                {contactRows.map((row) => (
                  <div key={row.key} className="flex gap-3 text-sm">
                    <row.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="break-all font-medium text-foreground">{row.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">{t("modules.supplier.detail.locations.title")}</CardTitle>
                <Badge variant="secondary" className="size-7 rounded-full p-0 tabular-nums">
                  {locations.length}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {locations.map((loc) => (
                  <div key={`${loc.name}-${loc.cityState}`} className="flex gap-3 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-medium text-foreground">{loc.name}</span>
                      <span className="text-muted-foreground">{loc.cityState}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0">
            <Tabs defaultValue="segments" className="flex flex-col gap-4">
              <TabsList className="h-auto w-full justify-center gap-0 rounded-none border-b border-border bg-transparent p-0">
                <TabsTrigger
                  value="segments"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {t("modules.supplier.detail.tabs.segments")}
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {t("modules.supplier.detail.tabs.recent")}
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {t("modules.supplier.detail.tabs.performance")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="segments" className="mt-0 outline-none">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">{t("modules.supplier.detail.segments.title")}</CardTitle>
                        <Badge variant="secondary" className="tabular-nums">
                          {segments.length}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("modules.supplier.detail.segments.subtitle")}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {segments.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recent" className="mt-0 outline-none">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">{t("modules.supplier.detail.recent.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="rounded-xl border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("modules.supplier.detail.recent.table.code")}</TableHead>
                            <TableHead>{t("modules.supplier.detail.recent.table.date")}</TableHead>
                            <TableHead className="text-right">
                              {t("modules.supplier.detail.recent.table.items")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("modules.supplier.detail.recent.table.total")}
                            </TableHead>
                            <TableHead>{t("modules.supplier.detail.recent.table.status")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentQuotations.map((row) => (
                            <TableRow key={row.code}>
                              <TableCell className="font-medium tabular-nums">{row.code}</TableCell>
                              <TableCell className="text-muted-foreground tabular-nums">{row.dateLabel}</TableCell>
                              <TableCell className="text-right tabular-nums">{row.itemsCount}</TableCell>
                              <TableCell className="text-right font-medium tabular-nums">{row.totalLabel}</TableCell>
                              <TableCell>
                                <RecentQuotationStatusBadge status={row.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-0 outline-none">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">{t("modules.supplier.detail.performance.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6 pt-0">
                    <GradientIndicatorBar
                      label={t("modules.supplier.detail.performance.responseRate")}
                      value={performance.responseRatePercent}
                    />
                    <GradientIndicatorBar
                      label={t("modules.supplier.detail.performance.expiredQuotations")}
                      value={performance.expiredQuotationsPercent}
                    />
                    <GradientIndicatorBar
                      label={t("modules.supplier.detail.performance.deliveryPunctuality")}
                      value={performance.deliveryPunctualityPercent}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
