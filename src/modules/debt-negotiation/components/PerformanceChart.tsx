import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useI18n } from "@/shared/i18n/useI18n";

const valueData = [
  { date: "01/Mar", negotiated: 0, recovered: 0 },
  { date: "02/Mar", negotiated: 12500, recovered: 3200 },
  { date: "03/Mar", negotiated: 18700, recovered: 4100 },
  { date: "04/Mar", negotiated: 22300, recovered: 5800 },
  { date: "05/Mar", negotiated: 15200, recovered: 3500 },
  { date: "06/Mar", negotiated: 19800, recovered: 2900 },
  { date: "07/Mar", negotiated: 8500, recovered: 1200 },
  { date: "08/Mar", negotiated: 9200, recovered: 800 },
  { date: "09/Mar", negotiated: 21500, recovered: 4600 },
  { date: "10/Mar", negotiated: 18400, recovered: 3800 },
];

const quantityData = [
  { date: "01/Mar", negotiated: 0, recovered: 0 },
  { date: "02/Mar", negotiated: 2, recovered: 3 },
  { date: "03/Mar", negotiated: 4, recovered: 2 },
  { date: "04/Mar", negotiated: 4, recovered: 2 },
  { date: "05/Mar", negotiated: 0, recovered: 1 },
  { date: "06/Mar", negotiated: 3, recovered: 1 },
  { date: "07/Mar", negotiated: 0, recovered: 0 },
  { date: "08/Mar", negotiated: 0, recovered: 0 },
  { date: "09/Mar", negotiated: 1, recovered: 2 },
  { date: "10/Mar", negotiated: 4, recovered: 3 },
];

export function PerformanceChart() {
  const [mode, setMode] = useState<"value" | "quantity">("value");
  const { locale, t } = useI18n();
  const chartData = mode === "value" ? valueData : quantityData;

  return (
    <div className="card-surface animate-fade-in p-5 opacity-0" style={{ animationDelay: "300ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="section-title">{t("dashboard.performance.title")}</h3>
          <p className="section-subtitle">{t("dashboard.performance.subtitle")}</p>
        </div>
        <div className="flex rounded-lg border border-border bg-background p-0.5">
          <button
            type="button"
            onClick={() => setMode("value")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              mode === "value"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("dashboard.performance.valueMode")}
          </button>
          <button
            type="button"
            onClick={() => setMode("quantity")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              mode === "quantity"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("dashboard.performance.quantityMode")}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="grad-negotiated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-recovered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
            tickFormatter={(value) => (mode === "value" ? `R$${(value / 1000).toFixed(0)}k` : String(value))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(214, 32%, 91%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) =>
              mode === "value" ? [`R$ ${value.toLocaleString(locale)}`, ""] : [value, ""]
            }
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "hsl(215, 16%, 47%)" }}
          />
          <Area
            type="monotone"
            dataKey="negotiated"
            name={t("dashboard.performance.negotiated")}
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#grad-negotiated)"
          />
          <Area
            type="monotone"
            dataKey="recovered"
            name={t("dashboard.performance.recovered")}
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#grad-recovered)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
