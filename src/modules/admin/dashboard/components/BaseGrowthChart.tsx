import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { OrcaCartesianGrid } from "@/shared/charts";
import { orcaTooltipContentStyle } from "@/shared/charts/OrcaChartTooltip";
import { AdminChartCard } from "@/modules/admin/dashboard/components/AdminChartCard";
import { BASE_GROWTH_SERIES } from "@/modules/admin/dashboard/data/adminDashboardMocks";

export function BaseGrowthChart() {
  return (
    <AdminChartCard
      title="Crescimento da base"
      subtitle="Restaurantes e fornecedores cadastrados"
    >
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--chart-1))]" />
          Restaurantes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--chart-4))]" />
          Fornecedores
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={BASE_GROWTH_SERIES}>
          <OrcaCartesianGrid />
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip contentStyle={orcaTooltipContentStyle()} />
          <Line
            type="monotone"
            dataKey="restaurants"
            name="Restaurantes"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="suppliers"
            name="Fornecedores"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </AdminChartCard>
  );
}
