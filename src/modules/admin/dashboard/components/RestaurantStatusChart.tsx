import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { AdminChartCard } from "@/modules/admin/dashboard/components/AdminChartCard";
import { RESTAURANT_STATUS_BREAKDOWN } from "@/modules/admin/dashboard/data/adminDashboardMocks";
import { formatCount } from "@/modules/admin/dashboard/lib/format";

export function RestaurantStatusChart() {
  return (
    <AdminChartCard title="Status dos restaurantes" subtitle="Distribuição da base">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={RESTAURANT_STATUS_BREAKDOWN}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
            >
              {RESTAURANT_STATUS_BREAKDOWN.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCount(value)} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="flex flex-1 flex-col gap-2 text-sm">
          {RESTAURANT_STATUS_BREAKDOWN.map((item) => (
            <li key={item.status} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.status}
              </span>
              <span className="font-medium text-foreground">{formatCount(item.count)}</span>
            </li>
          ))}
        </ul>
      </div>
    </AdminChartCard>
  );
}
