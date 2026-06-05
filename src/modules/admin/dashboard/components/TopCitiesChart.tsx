import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AdminChartCard } from "@/modules/admin/dashboard/components/AdminChartCard";
import { TOP_CITIES } from "@/modules/admin/dashboard/data/adminDashboardMocks";

export function TopCitiesChart() {
  return (
    <AdminChartCard title="Top cidades" subtitle="Restaurantes por localização">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={TOP_CITIES} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" axisLine={false} tickLine={false} />
          <YAxis
            dataKey="city"
            type="category"
            axisLine={false}
            tickLine={false}
            width={110}
            fontSize={11}
          />
          <Tooltip contentStyle={{ borderRadius: 10 }} />
          <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </AdminChartCard>
  );
}
