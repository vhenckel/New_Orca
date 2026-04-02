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
import { useRenegotiationDetails } from "@/modules/debt-negotiation/hooks";
import type { RenegotiationDailyRow } from "@/modules/debt-negotiation/types/renegotiation-details";
import { formatCurrencyBRL } from "@/shared/components/dynamic-filters/filters/currency";
import { useI18n } from "@/shared/i18n/useI18n";
import { useDetailsShowValues } from "@/shared/lib/nuqs-filters";

function formatDailyDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${day}/${month}`;
}

function mapDetailsToChartData(rows: RenegotiationDailyRow[]): { date: string; negotiated: number; recovered: number }[] {
  return rows.map((row) => ({
    date: formatDailyDate(row.date),
    negotiated: (Number(row.negotiated) || 0) + (Number(row.negotiatedWithoutPayment) || 0),
    recovered: Number(row.recovered) || 0,
  }));
}

function formatTooltipValue(
  raw: number | string | undefined,
  showValues: "value" | "quantity",
  locale: string,
): string {
  const n = Number(raw);
  const v = Number.isFinite(n) ? n : 0;
  if (showValues === "value") {
    return formatCurrencyBRL(v) || "R$ 0,00";
  }
  return v.toLocaleString(locale, { maximumFractionDigits: 0 });
}

export function PerformanceChart() {
  const [showValues, setShowValues] = useDetailsShowValues();
  const { data, error } = useRenegotiationDetails({ showValues });
  const { locale, t } = useI18n();

  const chartData = data?.values?.length ? mapDetailsToChartData(data.values) : [];

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
            onClick={() => setShowValues("value")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              showValues === "value"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("dashboard.performance.valueMode")}
          </button>
          <button
            type="button"
            onClick={() => setShowValues("quantity")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              showValues === "quantity"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("dashboard.performance.quantityMode")}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive">Erro ao carregar gráfico.</p>
      )}

      {chartData.length === 0 && !error ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          Nenhum dado no período.
        </div>
      ) : (
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
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                showValues === "value" ? `R$${(value / 1000).toFixed(0)}k` : String(value)
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-xs shadow-md">
                    {label != null && String(label) !== "" && (
                      <p className="mb-1.5 font-medium text-foreground">{label}</p>
                    )}
                    <ul className="m-0 list-none space-y-1 p-0">
                      {payload.map((item, index) => (
                        <li
                          key={String(item.dataKey ?? index)}
                          className="flex min-w-[10rem] items-center gap-2 leading-none"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                            {formatTooltipValue(item.value, showValues, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }}
            />
            <Legend iconType="circle" iconSize={8} />
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
      )}
    </div>
  );
}
