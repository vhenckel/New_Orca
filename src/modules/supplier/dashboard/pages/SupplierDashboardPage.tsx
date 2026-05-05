import { ArrowRight, BarChart3, CheckCircle2, Clock, FileText, TrendingUp, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import {
  SUPPLIER_QUOTATION_LIST_MOCKS,
  type SupplierQuotationListItem,
  type SupplierQuotationPriority,
} from "@/modules/supplier/quotation/data/supplierQuotationMocks";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

const CATEGORY_COLORS: Record<string, string> = {
  Hortifruti: "bg-green-500",
  Bebidas: "bg-blue-500",
  Secos: "bg-yellow-500",
  Carnes: "bg-red-500",
  Mercearia: "bg-purple-500",
  Laticinios: "bg-sky-500",
  Acucares: "bg-orange-400",
  Descartaveis: "bg-gray-400",
  Temperos: "bg-teal-500",
};

const FALLBACK_CATEGORY_COLOR = "bg-slate-400";

function priorityBadgeClass(priority: SupplierQuotationPriority): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface OpportunityItem {
  icon: typeof CheckCircle2;
  text: string;
}

function useSupplierDashboardData() {
  return useMemo(() => {
    const openOrders = SUPPLIER_QUOTATION_LIST_MOCKS.filter((q) => q.status !== "responded");
    const highPriorityCount = openOrders.filter((q) => q.priority === "high").length;
    const totalItems = SUPPLIER_QUOTATION_LIST_MOCKS.reduce((acc, q) => acc + q.requestedItems, 0);
    const avgProgress = Math.round(
      SUPPLIER_QUOTATION_LIST_MOCKS.reduce((acc, q) => acc + q.progress, 0) /
        SUPPLIER_QUOTATION_LIST_MOCKS.length,
    );

    const queue: SupplierQuotationListItem[] = [...openOrders].sort((a, b) => {
      const statusOrder = { in_progress: 0, attention: 1, pending: 2, responded: 3 } as const;
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
    });

    const categoryMap = new Map<string, number>();
    for (const q of SUPPLIER_QUOTATION_LIST_MOCKS) {
      for (const cat of q.categories) {
        categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + q.requestedItems);
      }
    }
    const categoryDemand = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    const maxCategoryItems = categoryDemand[0]?.[1] ?? 1;

    return { openOrders, highPriorityCount, totalItems, avgProgress, queue, categoryDemand, maxCategoryItems };
  }, []);
}

export function SupplierDashboardPage() {
  const { t } = useI18n();
  const { openOrders, highPriorityCount, totalItems, avgProgress, queue, categoryDemand, maxCategoryItems } =
    useSupplierDashboardData();

  const opportunities: OpportunityItem[] = [
    {
      icon: CheckCircle2,
      text: "Priorize Casa do Chef: maior ticket estimado e prazo ainda hoje.",
    },
    {
      icon: CheckCircle2,
      text: "Finalize Bistró Mercado Norte: faltam poucos itens para enviar a resposta.",
    },
    {
      icon: CheckCircle2,
      text: "Bebidas tem recorrência alta; vale preparar uma tabela rápida por marca.",
    },
  ];

  const headerActions = (
    <Button asChild className="text-white">
      <Link to="/supplier/quotations">
        <TrendingUp className="mr-2 size-4" />
        {t("modules.supplierPortal.dashboard.viewQuotations")}
      </Link>
    </Button>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.supplierPortal.dashboard.pageTitle")}
      subtitle={t("modules.supplierPortal.dashboard.pageSubtitle")}
      headerActions={headerActions}
    >
      <div className="flex flex-col gap-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label={t("modules.supplierPortal.dashboard.kpi.openOrders")}
            hint={t("modules.supplierPortal.dashboard.kpi.openOrdersHint")}
            value={openOrders.length}
            icon={<Clock className="size-4 text-orange-500" />}
          />
          <KpiCard
            label={t("modules.supplierPortal.dashboard.kpi.highPriority")}
            hint={t("modules.supplierPortal.dashboard.kpi.highPriorityHint")}
            value={highPriorityCount}
            icon={<TriangleAlert className="size-4 text-red-500" />}
          />
          <KpiCard
            label={t("modules.supplierPortal.dashboard.kpi.itemsRequested")}
            hint={t("modules.supplierPortal.dashboard.kpi.itemsRequestedHint")}
            value={totalItems}
            icon={<BarChart3 className="size-4 text-blue-500" />}
          />
          <KpiCard
            label={t("modules.supplierPortal.dashboard.kpi.avgProgress")}
            hint={t("modules.supplierPortal.dashboard.kpi.avgProgressHint")}
            value={`${avgProgress}%`}
            icon={<TrendingUp className="size-4 text-green-500" />}
          />
        </div>

        {/* Main content: queue + sidebar */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          {/* Queue */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="text-base font-semibold">
                    {t("modules.supplierPortal.dashboard.queue.title")}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {t("modules.supplierPortal.dashboard.queue.subtitle")}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {t("modules.supplierPortal.dashboard.queue.pendingBadge", { count: queue.length })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {queue.map((item) => (
                <QuotationQueueRow key={item.id} item={item} t={t} />
              ))}
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Opportunities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="size-4 text-green-500" />
                  {t("modules.supplierPortal.dashboard.opportunities.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {opportunities.map((opp, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                    <p className="text-xs leading-relaxed text-muted-foreground">{opp.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Category demand */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="text-sm font-semibold">
                    {t("modules.supplierPortal.dashboard.demand.title")}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {t("modules.supplierPortal.dashboard.demand.subtitle")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {categoryDemand.map(([category, count]) => (
                  <div key={category} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-xs text-muted-foreground">
                        {t("modules.supplierPortal.dashboard.demand.items", { count })}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", CATEGORY_COLORS[category] ?? FALLBACK_CATEGORY_COLOR)}
                        style={{ width: `${Math.round((count / maxCategoryItems) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}

function KpiCard({
  label,
  hint,
  value,
  icon,
}: {
  label: string;
  hint: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  );
}

function QuotationQueueRow({
  item,
  t,
}: {
  item: SupplierQuotationListItem;
  t: (key: string, params?: Record<string, unknown>) => string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_140px_170px_120px] md:items-center md:gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          <FileText className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/supplier/quotations/${item.id}`}
              className="text-sm font-semibold tabular-nums hover:underline"
            >
              #{item.id}
            </Link>
            <Badge
              variant="outline"
              className={cn("rounded-full border px-2 py-0 text-xs", priorityBadgeClass(item.priority))}
            >
              {t(`modules.supplierPortal.dashboard.priority.${item.priority}`)}
            </Badge>
          </div>
          <p className="truncate pt-1 text-[22px] font-medium leading-none tracking-tight md:text-base md:tracking-normal">
            {item.restaurantName}
          </p>
          <p className="truncate pt-1 text-xs text-muted-foreground">{item.title}</p>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] text-muted-foreground">{t("modules.supplierPortal.dashboard.queue.deadline")}</span>
        <span className="text-sm font-medium">{formatDate(item.deadlineAt)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-muted-foreground">{t("modules.supplierPortal.dashboard.queue.progress")}</span>
        <div className="flex items-center gap-2">
          <Progress value={item.progress} className="h-1.5 w-[110px]" />
          <span className="text-xs font-semibold tabular-nums">{item.progress}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end">
        <span className="text-xl font-semibold tabular-nums md:text-base">{item.estimatedTotal}</span>
        <Button asChild size="icon" variant="ghost" className="size-8">
          <Link to={`/supplier/quotations/${item.id}`} aria-label={`Abrir cotação #${item.id}`}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
