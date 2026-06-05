import { AdminChartCard } from "@/modules/admin/dashboard/components/AdminChartCard";
import { BILLING_FORECAST } from "@/modules/admin/dashboard/data/adminDashboardMocks";

export function BillingForecastCard() {
  const { nextMonth, nextQuarter, nextYear, averageTicket, estimatedLtv } = BILLING_FORECAST;

  return (
    <AdminChartCard title="Previsão de faturamento" subtitle="Baseado no ritmo atual de crescimento">
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {nextMonth.label}
          </p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{nextMonth.value}</p>
          <p className="mt-1 text-sm font-medium text-success">{nextMonth.change}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">{nextQuarter.label}</p>
            <p className="mt-1 text-lg font-semibold">{nextQuarter.value}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">{nextYear.label}</p>
            <p className="mt-1 text-lg font-semibold">{nextYear.value}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <p>
            Ticket médio: <span className="font-medium text-foreground">{averageTicket}</span>
          </p>
          <p>
            LTV estimado: <span className="font-medium text-foreground">{estimatedLtv}</span>
          </p>
        </div>
      </div>
    </AdminChartCard>
  );
}
