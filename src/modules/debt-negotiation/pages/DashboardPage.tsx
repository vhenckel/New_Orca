import { ActivityFeed } from "@/modules/debt-negotiation/components/ActivityFeed";
import { AverageTicketCard } from "@/modules/debt-negotiation/components/AverageTicketCard";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { DailyTable } from "@/modules/debt-negotiation/components/DailyTable";
import { DonutCard } from "@/modules/debt-negotiation/components/DonutCard";
import { KPICard } from "@/modules/debt-negotiation/components/KPICard";
import { MetricCard } from "@/modules/debt-negotiation/components/MetricCard";
import { NegotiationFunnel } from "@/modules/debt-negotiation/components/NegotiationFunnel";
import { NpsCard } from "@/modules/debt-negotiation/components/NpsCard";
import { PerformanceChart } from "@/modules/debt-negotiation/components/PerformanceChart";
import { SubscriptionPlanCard } from "@/modules/debt-negotiation/components/SubscriptionPlanCard";
import {
  useRenegotiationBoxes,
  useRenegotiationGraphics,
} from "@/modules/debt-negotiation/hooks";
import { useRenegotiationPlanUsage } from "@/modules/debt-negotiation/hooks";
import type {
  KpiMetric,
  OperationalMetric,
  PortfolioBreakdownItem,
} from "@/modules/debt-negotiation/types";
import type { RenegotiationBoxesResponse } from "@/modules/debt-negotiation/types/renegotiation-boxes";
import { toDonutSeries } from "@/modules/debt-negotiation/types/renegotiation-graphics";
import {
  formatCurrency,
  formatPercent,
  formatPercentChange,
  formatPp,
} from "@/shared/lib/format";
import type { TranslationKey } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/useI18n";
import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { getPlanAlerts } from "@/modules/debt-negotiation/utils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import {
  debtNegotiationPathWithDateRange,
  useDebtNegotiationDateRangeQueryState,
} from "@/shared/lib/nuqs-filters";

function trendFromChange(
  percentageChange: number | null | undefined,
): "up" | "down" {
  if (percentageChange == null || Number.isNaN(percentageChange)) return "up";
  return percentageChange >= 0 ? "up" : "down";
}

const PLANS_PAGE_URL = "https://renegociacao.agentedeia.o2obots.com/#planos";

function mapBoxesToKpiMetrics(
  data: RenegotiationBoxesResponse,
  t: (key: string) => string,
): KpiMetric[] {
  const d = data;
  return [
    {
      label: t("dashboard.kpis.totalDebts"),
      value: formatCurrency(d.totalDebt.currentValue),
      change: formatPercentChange(d.totalDebt.percentageChange),
      trend: trendFromChange(d.totalDebt.percentageChange),
      percentage: "100%",
      delay: 0,
      drilldownPath: "/debt-negotiation/renegotiation-details",
    },
    {
      label: t("dashboard.kpis.totalNegotiated"),
      value: formatCurrency(d.totalNegotiated.currentValue),
      change: formatPercentChange(d.totalNegotiated.percentageChange),
      trend: trendFromChange(d.totalNegotiated.percentageChange),
      percentage:
        d.totalNegotiated.percentage != null
          ? formatPercent(d.totalNegotiated.percentage)
          : undefined,
      delay: 50,
      drilldownPath: "/debt-negotiation/negotiated-details",
    },
    {
      label: t("dashboard.kpis.totalRecovered"),
      value: formatCurrency(d.totalRecoveredNegotiated.currentValue),
      change: formatPercentChange(d.totalRecoveredNegotiated.percentageChange),
      trend: trendFromChange(d.totalRecoveredNegotiated.percentageChange),
      percentage:
        d.totalRecoveredNegotiated.percentage != null
          ? formatPercent(d.totalRecoveredNegotiated.percentage)
          : undefined,
      delay: 100,
      drilldownPath: "/debt-negotiation/recovered-details",
    },
    {
      label: t("dashboard.kpis.recoveryRate"),
      value: formatPercent(d.recoveryRate.currentValue),
      change: formatPp(d.recoveryRate.percentageChange),
      trend: trendFromChange(d.recoveryRate.percentageChange),
      delay: 150,
    },
  ];
}

function mapBoxesToOperationalMetrics(
  data: RenegotiationBoxesResponse,
  t: (key: string) => string,
): OperationalMetric[] {
  const d = data;
  const totalDebtors = d.totalDebtCount.currentValue;
  const totalNegotiated = d.totalNegotiatedCount.currentValue;
  const totalRecovered = d.totalRecoveredCount.currentValue;

  const pctRecoveredOverNegotiations =
    totalNegotiated > 0 ? (totalRecovered / totalNegotiated) * 100 : undefined;
  const recoveryRateQuantity =
    totalDebtors > 0 ? (totalRecovered / totalDebtors) * 100 : undefined;

  return [
    {
      label: t("dashboard.kpis.totalDebtors"),
      value: String(totalDebtors),
      subtitle: t("dashboard.subtitles.debtorsBase"),
      delay: 200,
    },
    {
      label: t("dashboard.kpis.activeNegotiations"),
      value: String(totalNegotiated),
      subtitle:
        d.totalNegotiatedCount.percentage != null
          ? `${formatPercent(d.totalNegotiatedCount.percentage)} ${t("dashboard.subtitles.activeNegotiations")}`
          : undefined,
      delay: 250,
    },
    {
      label: t("dashboard.kpis.closedAgreements"),
      value: String(totalRecovered),
      subtitle:
        pctRecoveredOverNegotiations != null
          ? `${formatPercent(pctRecoveredOverNegotiations)} ${t("dashboard.subtitles.closedAgreements")}`
          : undefined,
      delay: 300,
    },
    {
      label: t("dashboard.kpis.conversionRate"),
      value:
        recoveryRateQuantity != null
          ? formatPercent(recoveryRateQuantity)
          : "-",
      subtitle: undefined,
      delay: 350,
    },
  ];
}

const FALLBACK_DEBT_AGE: PortfolioBreakdownItem[] = [
  {
    name: "dashboard.donut.debtAge.upTo90",
    value: 70,
    color: "hsl(var(--chart-1))",
  },
  {
    name: "dashboard.donut.debtAge.upTo365",
    value: 21,
    color: "hsl(var(--chart-2))",
  },
  {
    name: "dashboard.donut.debtAge.over365",
    value: 9,
    color: "hsl(var(--chart-3))",
  },
];
const FALLBACK_DEBT_VALUE: PortfolioBreakdownItem[] = [
  {
    name: "dashboard.donut.debtValue.upTo2k",
    value: 60,
    color: "hsl(var(--chart-1))",
  },
  {
    name: "dashboard.donut.debtValue.2kTo5k",
    value: 22,
    color: "hsl(var(--chart-2))",
  },
  {
    name: "dashboard.donut.debtValue.5kTo10k",
    value: 17,
    color: "hsl(var(--chart-3))",
  },
  {
    name: "dashboard.donut.debtValue.over10k",
    value: 1,
    color: "hsl(var(--chart-4))",
  },
];
const FALLBACK_DEBTOR_AGE: PortfolioBreakdownItem[] = [
  {
    name: "dashboard.donut.debtorAge.31to40",
    value: 33,
    color: "hsl(var(--chart-1))",
  },
  {
    name: "dashboard.donut.debtorAge.41to50",
    value: 35,
    color: "hsl(var(--chart-2))",
  },
  {
    name: "dashboard.donut.debtorAge.51to60",
    value: 15,
    color: "hsl(var(--chart-3))",
  },
  {
    name: "dashboard.donut.debtorAge.other",
    value: 17,
    color: "hsl(var(--chart-4))",
  },
];

export function DashboardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { startDate, endDate } = useDebtNegotiationDateRangeQueryState();
  const dateRange = { startDate, endDate };
  const { data: boxesData, error } = useRenegotiationBoxes();
  const { data: graphicsData } = useRenegotiationGraphics();
  const companyId = getCurrentCompanyId();
  const { data: planUsageData } = useRenegotiationPlanUsage({ companyId });
  const planAlerts = useMemo(
    () => getPlanAlerts(planUsageData, companyId, t),
    [planUsageData, companyId, t],
  );

  const planAlertClassName = (variant: "default" | "destructive") =>
    variant === "destructive"
      ? "border-destructive/40 bg-destructive/10 text-foreground py-3 [&>svg]:text-destructive"
      : "border-amber-500/40 bg-amber-500/10 text-foreground py-3 [&>svg]:text-amber-500";

  const debtAgeLabel = (name: string) =>
    t(
      ({
        lessThan90: "dashboard.donut.debtAge.upTo90",
        between90And365: "dashboard.donut.debtAge.upTo365",
        moreThan365: "dashboard.donut.debtAge.over365",
      }[name] ?? "dashboard.donut.debtAge.upTo90") as TranslationKey,
    );
  const debtValueLabel = (name: string) =>
    t(
      ({
        upTo2000: "dashboard.donut.debtValue.upTo2k",
        between2001And5000: "dashboard.donut.debtValue.2kTo5k",
        between5001And50000: "dashboard.donut.debtValue.5kTo10k",
        moreThan50000: "dashboard.donut.debtValue.over10k",
      }[name] ?? "dashboard.donut.debtValue.upTo2k") as TranslationKey,
    );
  const debtorsAgeLabel = (name: string) =>
    t(
      ({
        between18And20: "dashboard.donut.debtorAge.18to20",
        between21And25: "dashboard.donut.debtorAge.21to25",
        between26And30: "dashboard.donut.debtorAge.26to30",
        between31And40: "dashboard.donut.debtorAge.31to40",
        between41And50: "dashboard.donut.debtorAge.41to50",
        between51And60: "dashboard.donut.debtorAge.51to60",
        between61And70: "dashboard.donut.debtorAge.61to70",
        between71OrMore: "dashboard.donut.debtorAge.71plus",
      }[name] ?? "dashboard.donut.debtorAge.other") as TranslationKey,
    );

  const debtAgeSeries = toDonutSeries(graphicsData?.debtAge, debtAgeLabel);
  const debtAgeData: PortfolioBreakdownItem[] =
    debtAgeSeries.length > 0
      ? debtAgeSeries
      : FALLBACK_DEBT_AGE.map((item) => ({
          ...item,
          name: t(item.name as TranslationKey),
        }));

  const debtValueSeries = toDonutSeries(
    graphicsData?.debtValue,
    debtValueLabel,
  );
  const debtValueData: PortfolioBreakdownItem[] =
    debtValueSeries.length > 0
      ? debtValueSeries
      : FALLBACK_DEBT_VALUE.map((item) => ({
          ...item,
          name: t(item.name as TranslationKey),
        }));

  const debtorAgeSeries = toDonutSeries(
    graphicsData?.debtorsAge,
    debtorsAgeLabel,
  );
  const debtorAgeData: PortfolioBreakdownItem[] =
    debtorAgeSeries.length > 0
      ? debtorAgeSeries
      : FALLBACK_DEBTOR_AGE.map((item) => ({
          ...item,
          name: t(item.name as TranslationKey),
        }));

  const kpiMetrics: KpiMetric[] =
    boxesData != null
      ? mapBoxesToKpiMetrics(boxesData, t)
      : [
          {
            label: t("dashboard.kpis.totalDebts"),
            value: "-",
            change: "-",
            trend: "up",
            percentage: "100%",
            delay: 0,
            drilldownPath: "/debt-negotiation/renegotiation-details",
          },
          {
            label: t("dashboard.kpis.totalNegotiated"),
            value: "-",
            change: "-",
            trend: "up",
            percentage: "-",
            delay: 50,
            drilldownPath: "/debt-negotiation/negotiated-details",
          },
          {
            label: t("dashboard.kpis.totalRecovered"),
            value: "-",
            change: "-",
            trend: "up",
            percentage: "-",
            delay: 100,
            drilldownPath: "/debt-negotiation/recovered-details",
          },
          {
            label: t("dashboard.kpis.recoveryRate"),
            value: "-",
            change: "-",
            trend: "up",
            delay: 150,
          },
        ];

  const operationalMetrics: OperationalMetric[] =
    boxesData != null
      ? mapBoxesToOperationalMetrics(boxesData, t)
      : [
          {
            label: t("dashboard.kpis.totalDebtors"),
            value: "-",
            subtitle: t("dashboard.subtitles.debtorsBase"),
            delay: 200,
          },
          {
            label: t("dashboard.kpis.activeNegotiations"),
            value: "-",
            delay: 250,
          },
          {
            label: t("dashboard.kpis.closedAgreements"),
            value: "-",
            delay: 300,
          },
          {
            label: t("dashboard.kpis.conversionRate"),
            value: "-",
            subtitle: t("dashboard.subtitles.conversionRate"),
            delay: 350,
          },
        ];

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.debtNegotiation.routes.dashboard.label")}
      subtitle={t("modules.debtNegotiation.routes.dashboard.description")}
    >
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {t("pages.debtNegotiation.debts.errors.loadDashboard")}
          </AlertDescription>
        </Alert>
      )}
      {planAlerts.map((alert) => (
        <Alert
          key={`${alert.kind}-${alert.title}`}
          variant={alert.variant}
          className={planAlertClassName(alert.variant)}
        >
          <AlertCircle className="size-4" />
          <AlertDescription className="flex min-h-10 items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold leading-5 text-foreground">
                {alert.title}
              </p>
              <p className="text-sm leading-5 text-foreground/90">
                {alert.content}
              </p>
            </div>
            <Button asChild size="sm" className="h-8 shrink-0 px-3">
              <a href={PLANS_PAGE_URL} target="_blank" rel="noreferrer">
                {t("dashboard.subscription.plan.upgradeCta")}
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      ))}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <KPICard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            percentage={metric.percentage}
            delay={metric.delay}
            onClick={
              metric.drilldownPath
                ? () =>
                    void navigate(
                      debtNegotiationPathWithDateRange(
                        metric.drilldownPath!,
                        dateRange,
                      ),
                    )
                : undefined
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {operationalMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NpsCard />
        </div>
        <div className="flex flex-col gap-4">
          <AverageTicketCard
            value={boxesData?.averageTicket?.currentValue}
            delay={350}
          />
          <SubscriptionPlanCard
            planType={planUsageData?.planType}
            endDate={planUsageData?.endDate}
            debtsLimit={planUsageData?.debtsLimit}
            delay={400}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DonutCard
          title={t("dashboard.donut.debtAge")}
          data={debtAgeData}
          delay={400}
        />
        <DonutCard
          title={t("dashboard.donut.debtValue")}
          data={debtValueData}
          delay={450}
        />
        <DonutCard
          title={t("dashboard.donut.debtorAge")}
          data={debtorAgeData}
          delay={500}
        />
      </div>

      <PerformanceChart />

      <DailyTable />

      <div className="flex flex-col gap-6">
        <NegotiationFunnel />
        <div className="hidden">
          <ActivityFeed />
        </div>
      </div>
    </DashboardPageLayout>
  );
}
