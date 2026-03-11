import { ActivityFeed } from "@/modules/debt-negotiation/components/ActivityFeed";
import { AIStatusWidget } from "@/modules/debt-negotiation/components/AIStatusWidget";
import { DailyTable } from "@/modules/debt-negotiation/components/DailyTable";
import { DonutCard } from "@/modules/debt-negotiation/components/DonutCard";
import { KPICard } from "@/modules/debt-negotiation/components/KPICard";
import { MetricCard } from "@/modules/debt-negotiation/components/MetricCard";
import { NegotiationFunnel } from "@/modules/debt-negotiation/components/NegotiationFunnel";
import { PerformanceChart } from "@/modules/debt-negotiation/components/PerformanceChart";
import type {
  KpiMetric,
  OperationalMetric,
  PortfolioBreakdownItem,
} from "@/modules/debt-negotiation/types";
import { useI18n } from "@/shared/i18n/useI18n";

export function DashboardPage() {
  const { t } = useI18n();

  const debtAgeData: PortfolioBreakdownItem[] = [
    { name: t("dashboard.donut.debtAge.upTo90"), value: 70, color: "hsl(var(--chart-1))" },
    { name: t("dashboard.donut.debtAge.upTo365"), value: 21, color: "hsl(var(--chart-2))" },
    { name: t("dashboard.donut.debtAge.over365"), value: 9, color: "hsl(var(--chart-3))" },
  ];

  const debtValueData: PortfolioBreakdownItem[] = [
    { name: t("dashboard.donut.debtValue.upTo2k"), value: 60, color: "hsl(var(--chart-1))" },
    { name: t("dashboard.donut.debtValue.2kTo5k"), value: 22, color: "hsl(var(--chart-2))" },
    { name: t("dashboard.donut.debtValue.5kTo10k"), value: 17, color: "hsl(var(--chart-3))" },
    { name: t("dashboard.donut.debtValue.over10k"), value: 1, color: "hsl(var(--chart-4))" },
  ];

  const debtorAgeData: PortfolioBreakdownItem[] = [
    { name: t("dashboard.donut.debtorAge.31to40"), value: 33, color: "hsl(var(--chart-1))" },
    { name: t("dashboard.donut.debtorAge.41to50"), value: 35, color: "hsl(var(--chart-2))" },
    { name: t("dashboard.donut.debtorAge.51to60"), value: 15, color: "hsl(var(--chart-3))" },
    { name: t("dashboard.donut.debtorAge.other"), value: 17, color: "hsl(var(--chart-4))" },
  ];

  const kpiMetrics: KpiMetric[] = [
    {
      label: t("dashboard.kpis.totalDebts"),
      value: "R$ 1.266.819",
      change: t("dashboard.changes.previousMonth"),
      trend: "up",
      percentage: "100%",
      delay: 0,
    },
    {
      label: t("dashboard.kpis.totalNegotiated"),
      value: "R$ 128.141",
      change: t("dashboard.changes.negotiated"),
      trend: "up",
      percentage: "10,12%",
      delay: 50,
    },
    {
      label: t("dashboard.kpis.totalRecovered"),
      value: "R$ 21.503",
      change: t("dashboard.changes.recovered"),
      trend: "up",
      percentage: "16,78%",
      delay: 100,
    },
    {
      label: t("dashboard.kpis.recoveryRate"),
      value: "1,70%",
      change: t("dashboard.changes.recoveryRate"),
      trend: "up",
      delay: 150,
    },
  ];

  const operationalMetrics: OperationalMetric[] = [
    { label: t("dashboard.kpis.totalDebtors"), value: "381", subtitle: t("dashboard.subtitles.debtorsBase"), delay: 200 },
    {
      label: t("dashboard.kpis.activeNegotiations"),
      value: "47",
      subtitle: t("dashboard.subtitles.activeNegotiations"),
      delay: 250,
    },
    {
      label: t("dashboard.kpis.closedAgreements"),
      value: "14",
      subtitle: t("dashboard.subtitles.closedAgreements"),
      delay: 300,
    },
    {
      label: t("dashboard.kpis.conversionRate"),
      value: "3,67%",
      subtitle: t("dashboard.subtitles.conversionRate"),
      delay: 350,
    },
  ];

  return (
    <div className="space-y-6">
      <AIStatusWidget />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <KPICard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {operationalMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <NegotiationFunnel />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DonutCard title={t("dashboard.donut.debtAge")} data={debtAgeData} delay={400} />
        <DonutCard title={t("dashboard.donut.debtValue")} data={debtValueData} delay={450} />
        <DonutCard title={t("dashboard.donut.debtorAge")} data={debtorAgeData} delay={500} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyTable />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
