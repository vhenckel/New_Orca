import { ADMIN_DASHBOARD_KPIS } from "@/modules/admin/dashboard/data/adminDashboardMocks";
import { KpiCard } from "@/shared/components/dashboard-layout";
import { highlightedKpiClass } from "@/shared/lib/status-tones";
import { cn } from "@/shared/lib/utils";

export function AdminKpiSection() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {ADMIN_DASHBOARD_KPIS.map((item) => (
        <KpiCard
          key={item.label}
          label={item.label}
          value={item.value}
          trend={item.variation}
          trendTone={item.variationTone}
          icon={item.icon}
          className={cn(highlightedKpiClass(item.highlighted))}
        />
      ))}
    </section>
  );
}
