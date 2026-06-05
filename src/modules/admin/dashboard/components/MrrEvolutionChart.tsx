import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { OrcaCartesianGrid } from "@/shared/charts";
import { orcaTooltipContentStyle } from "@/shared/charts/OrcaChartTooltip";
import { AdminChartCard } from "@/modules/admin/dashboard/components/AdminChartCard";
import { MRR_EVOLUTION_SERIES } from "@/modules/admin/dashboard/data/adminDashboardMocks";
import { formatAxisCompactCurrency, formatCompactCurrency } from "@/modules/admin/dashboard/lib/format";

const MRR_Y_DOMAIN_MAX = 120_000;
const MRR_Y_TICKS = [0, 30_000, 60_000, 90_000, MRR_Y_DOMAIN_MAX];

export function MrrEvolutionChart() {
  return (
    <AdminChartCard title="Receita recorrente (MRR)" subtitle="Evolução nos últimos 6 meses">
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--chart-1))]" />
          MRR
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--chart-2))]" />
          Novos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--destructive))]" />
          Churn
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={MRR_EVOLUTION_SERIES}
          margin={{ top: 16, right: 12, left: 4, bottom: 8 }}
        >
          <OrcaCartesianGrid />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            dy={4}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={52}
            domain={[0, MRR_Y_DOMAIN_MAX]}
            ticks={MRR_Y_TICKS}
            allowDecimals={false}
            tickFormatter={formatAxisCompactCurrency}
            tick={{ fontSize: 11 }}
            tickMargin={8}
          />
          <Tooltip
            formatter={(value: number) => formatCompactCurrency(value)}
            contentStyle={orcaTooltipContentStyle()}
          />
          <Area
            type="monotone"
            dataKey="mrr"
            name="MRR"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="newRevenue"
            name="Novos"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="churn"
            name="Churn"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AdminChartCard>
  );
}
