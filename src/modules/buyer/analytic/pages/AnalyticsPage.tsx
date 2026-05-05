import { Clock, PiggyBank, ShoppingBag, Target, TrendingUp } from "lucide-react";
import { useState } from "react";

import { AnalyticsDeepAnalysis } from "@/modules/buyer/analytic/components/analytics/AnalyticsDeepAnalysis";
import { ANALYTICS_INSIGHTS, ANALYTICS_OPTIMIZATION } from "@/modules/buyer/analytic/data/analyticsMocks";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

const INSIGHT_ICONS = {
  amber: PiggyBank,
  rose: TrendingUp,
  yellow: ShoppingBag,
  sky: Clock,
} as const;

const INSIGHT_RING = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-100",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-200",
} as const;

export function AnalyticsPage() {
  const { t } = useI18n();
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("6m");

  const filterSuffix = (
    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full sm:w-[200px]" aria-label={t("modules.analytic.filters.categoryAria")}>
          <SelectValue placeholder={t("modules.analytic.category.all")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("modules.analytic.category.all")}</SelectItem>
          <SelectItem value="carnes">{t("modules.analytic.category.meats")}</SelectItem>
          <SelectItem value="hortifruti">{t("modules.analytic.category.produce")}</SelectItem>
          <SelectItem value="bebidas">{t("modules.analytic.category.drinks")}</SelectItem>
          <SelectItem value="laticinios">{t("modules.analytic.category.dairy")}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-full sm:w-[200px]" aria-label={t("modules.analytic.filters.periodAria")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1m">{t("modules.analytic.period.1m")}</SelectItem>
          <SelectItem value="3m">{t("modules.analytic.period.3m")}</SelectItem>
          <SelectItem value="6m">{t("modules.analytic.period.6m")}</SelectItem>
          <SelectItem value="12m">{t("modules.analytic.period.12m")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.analytic.pageTitle")}
      subtitle={t("modules.analytic.pageSubtitle")}
      headerActions={filterSuffix}
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            {t("modules.analytic.insights.sectionTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ANALYTICS_INSIGHTS.map((item) => {
              const Icon = INSIGHT_ICONS[item.tone];
              return (
                <Card key={item.id} className="rounded-2xl border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full",
                        INSIGHT_RING[item.tone],
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <p className="text-sm font-semibold leading-snug text-foreground">{t(item.titleKey)}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{t(item.bodyKey)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Target className="size-4 text-orange-600" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">
                {t("modules.analytic.optimization.sectionTitle")}
              </h2>
              <Badge variant="secondary" className="rounded-full">
                {t("modules.analytic.optimization.badgeCount", { count: ANALYTICS_OPTIMIZATION.length })}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{t("modules.analytic.optimization.sortHint")}</p>
          </div>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {ANALYTICS_OPTIMIZATION.map((row, index) => (
                <div key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-5">
                  <div className="flex shrink-0 items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                      {index + 1}
                    </span>
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{t(row.titleKey)}</span>
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          {t(row.categoryKey)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{t(row.bodyKey)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 justify-end sm:ml-auto sm:text-right">
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        row.impactVariant === "success" && "text-emerald-600",
                        row.impactVariant === "danger" && "text-red-600",
                      )}
                    >
                      {t(row.impactKey)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <AnalyticsDeepAnalysis />
      </div>
    </DashboardPageLayout>
  );
}
