import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { OrcaCartesianGrid } from "@/shared/charts";
import { orcaTooltipContentStyle } from "@/shared/charts/OrcaChartTooltip";
import { toneBadgeClass } from "@/shared/lib/status-tones";
import { AdminChartCard } from "@/modules/admin/dashboard/components/AdminChartCard";
import {
  QUOTATION_ACTIVITY_SERIES,
  QUOTATION_RESPONSE_RATE,
} from "@/modules/admin/dashboard/data/adminDashboardMocks";
import { Badge } from "@/shared/ui/badge";

export function QuotationActivityChart() {
  return (
    <AdminChartCard
      title="Atividade de cotações"
      subtitle="Criadas vs respondidas por semana"
      headerAction={
        <Badge variant="outline" className={toneBadgeClass("positive")}>
          {QUOTATION_RESPONSE_RATE} resposta
        </Badge>
      }
    >
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--chart-1))]" />
          Criadas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--chart-2))]" />
          Respondidas
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={QUOTATION_ACTIVITY_SERIES}>
          <OrcaCartesianGrid />
          <XAxis dataKey="week" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip contentStyle={orcaTooltipContentStyle()} />
          <Bar dataKey="created" name="Criadas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="responded" name="Respondidas" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </AdminChartCard>
  );
}
