import type { ReactNode } from "react";
import {
  Area,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_COLORS } from "@/shared/charts/chart-colors";
import { OrcaCartesianGrid } from "@/shared/charts/OrcaCartesianGrid";
import { OrcaChartTooltip, orcaTooltipContentStyle } from "@/shared/charts/OrcaChartTooltip";
import { OrcaOrangeGradient } from "@/shared/charts/chartGradients";

export interface OrcaLineSeries {
  dataKey: string;
  name?: string;
  color?: string;
  withArea?: boolean;
  strokeWidth?: number;
}

interface OrcaLineChartProps<T extends Record<string, unknown>> {
  data: T[];
  xDataKey: keyof T & string;
  series: OrcaLineSeries[];
  height?: number;
  yTickFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  margin?: { top?: number; right?: number; left?: number; bottom?: number };
  children?: ReactNode;
}

export function OrcaLineChart<T extends Record<string, unknown>>({
  data,
  xDataKey,
  series,
  height = 240,
  yTickFormatter,
  tooltipFormatter,
  margin = { top: 8, right: 12, left: 4, bottom: 8 },
  children,
}: OrcaLineChartProps<T>) {
  const primarySeries = series[0];
  const gradientId = "orca-line-gradient";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={margin}>
        <defs>
          <OrcaOrangeGradient id={gradientId} />
        </defs>
        <OrcaCartesianGrid />
        <XAxis dataKey={xDataKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={yTickFormatter}
        />
        <Tooltip
          content={<OrcaChartTooltip />}
          formatter={
            tooltipFormatter
              ? (value: number) => tooltipFormatter(value)
              : undefined
          }
          contentStyle={orcaTooltipContentStyle()}
        />
        {primarySeries?.withArea !== false && (
          <Area
            type="monotone"
            dataKey={primarySeries.dataKey}
            stroke="none"
            fill={`url(#${gradientId})`}
            fillOpacity={1}
          />
        )}
        {series.map((s, index) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color ?? (index === 0 ? CHART_COLORS.primary : CHART_COLORS.muted)}
            strokeWidth={s.strokeWidth ?? 2}
            dot={false}
          />
        ))}
        {children}
      </LineChart>
    </ResponsiveContainer>
  );
}
