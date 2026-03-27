import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRenegotiationNps } from "@/modules/debt-negotiation/hooks";
import type {
  NpsDailyTrendItem,
  NpsMonthlyTrendItem,
} from "@/modules/debt-negotiation/types/renegotiation-nps";
import { useI18n } from "@/shared/i18n/useI18n";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

const GAUGE_SIZE = 180;
const CENTER = GAUGE_SIZE / 2;
const RADIUS = 64;
const TRACK_WIDTH = 14;

/** Ângulo em graus: 0° = direita, 90° = baixo, 180° = esquerda. SVG: y para baixo. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** NPS (-100..100) → ângulo no semicírculo: -100 = 180°, 0 = 90°, 100 = 0°. */
function scoreToAngle(score: number): number {
  const clamped = Math.max(-100, Math.min(100, score));
  return 90 - (clamped / 100) * 90;
}

/** Ângulos das zonas NPS: detrator -100..-33, neutro -33..33, promotor 33..100 */
const ANGLE_AT_NEG33 = 90 - (-33 / 100) * 90; // ~120°
const ANGLE_AT_33 = 90 - (33 / 100) * 90; // ~60°

/** Arco como trilha (stroke grosso), sem preenchimento. */
function GaugeArc({
  startAngle,
  endAngle,
  color,
}: {
  startAngle: number;
  endAngle: number;
  color: string;
}) {
  const r = RADIUS;
  const x1 = CENTER + r * Math.cos(toRad(startAngle));
  const y1 = CENTER + r * Math.sin(toRad(startAngle));
  const x2 = CENTER + r * Math.cos(toRad(endAngle));
  const y2 = CENTER + r * Math.sin(toRad(endAngle));
  const d = `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={TRACK_WIDTH}
      strokeLinecap="round"
      strokeDasharray="4 3"
    />
  );
}

function NpsGauge({
  score,
  detractor,
  neutral,
  promoter,
  detractorLabel,
  neutralLabel,
  promoterLabel,
}: {
  score: number;
  detractor: number;
  neutral: number;
  promoter: number;
  detractorLabel: string;
  neutralLabel: string;
  promoterLabel: string;
}) {
  const angle = scoreToAngle(score);
  const dotX = CENTER + RADIUS * Math.cos(toRad(angle));
  const dotY = CENTER + RADIUS * Math.sin(toRad(angle));
  const dotColor =
    score < -33
      ? "hsl(var(--destructive))"
      : score < 33
        ? "hsl(25 95% 53%)"
        : "hsl(142 76% 36%)";

  return (
    <div className="flex flex-col items-center">
      <svg width={GAUGE_SIZE} height={GAUGE_SIZE} className="overflow-visible">
        {/* Trilha em 3 arcos: detrator (-100..-33), neutro (-33..33), promotor (33..100) */}
        <GaugeArc startAngle={180} endAngle={ANGLE_AT_NEG33} color="hsl(var(--destructive))" />
        <GaugeArc startAngle={ANGLE_AT_NEG33} endAngle={ANGLE_AT_33} color="hsl(25 95% 53%)" />
        <GaugeArc startAngle={ANGLE_AT_33} endAngle={0} color="hsl(142 76% 36%)" />
        {/* Indicador: ponto na posição do score */}
        <circle
          cx={dotX}
          cy={dotY}
          r={6}
          fill={dotColor}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
        {/* Score central */}
        <text
          x={CENTER}
          y={CENTER + 5}
          textAnchor="middle"
          className="fill-foreground text-2xl font-bold tabular-nums"
        >
          {Math.round(score)}
        </text>
      </svg>
      <div className="mt-3 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-destructive" />
          {detractorLabel}: {detractor > 0 ? detractor : "-"}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {neutralLabel}: {neutral > 0 ? neutral : "-"}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-600" />
          {promoterLabel}: {promoter > 0 ? promoter : "-"}
        </div>
      </div>
    </div>
  );
}

function formatDayLabel(day: string): string {
  return day.padStart(2, "0");
}

function isoToLocalDate(iso: string): Date {
  // Avoid timezone shift of `new Date("YYYY-MM-DD")` (interpreted as UTC).
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatMonthLabel(item: NpsMonthlyTrendItem): string {
  const month = Number(item.month ?? "");
  if (!Number.isFinite(month) || month < 1 || month > 12) return String(item.month ?? "");
  const d = new Date(item.year, month - 1, 1);
  return format(d, "MMM/yy", { locale: ptBR }).toUpperCase();
}

export function NpsCard() {
  const { t } = useI18n();
  const { data, error } = useRenegotiationNps();
  const { startDate, endDate } = useDateRangeQueryState();

  const sameMonthRange = isSameMonth(isoToLocalDate(startDate), isoToLocalDate(endDate));

  const chartData: { x: string; nps: number | null }[] =
    sameMonthRange
      ? (data?.dailyTrend?.map((item: NpsDailyTrendItem) => ({
          x: formatDayLabel(item.day),
          nps: item.value == null ? null : item.value,
        })) ?? [])
      : (data?.monthlyTrend?.map((item: NpsMonthlyTrendItem) => ({
          x: formatMonthLabel(item),
          nps: item.value == null ? null : item.value,
        })) ?? []);

  return (
    <div
      className="card-surface animate-fade-in overflow-hidden opacity-0"
      style={{ animationDelay: "350ms" }}
    >
      <div className="p-5 pb-0">
        <h3 className="mb-1 section-title">{t("dashboard.nps.title")}</h3>
      </div>
      <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center">
        <div className="shrink-0">
          {error ? (
            <p className="text-sm text-destructive">Erro ao carregar NPS.</p>
          ) : data ? (
            <NpsGauge
              score={data.currentScore}
              detractor={data.detractor}
              neutral={data.neutral}
              promoter={data.promoter}
              detractorLabel={t("dashboard.nps.detractor")}
              neutralLabel={t("dashboard.nps.neutral")}
              promoterLabel={t("dashboard.nps.promoter")}
            />
          ) : (
            <div className="flex h-[180px] w-[180px] items-center justify-center text-muted-foreground">
              —
            </div>
          )}
        </div>
        <div className="min-h-[200px] flex-1">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="x"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[-100, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | string | null | undefined) => [
                    value === null || value === undefined || Number.isNaN(Number(value)) ? "—" : value,
                    "NPS",
                  ]}
                  labelFormatter={(label) => (sameMonthRange ? `Dia ${label}` : `Mês ${label}`)}
                />
                <Line
                  type="linear"
                  dataKey="nps"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2.5}
                  dot={(props) => {
                    const v = (props.payload as { nps?: number | null }).nps;
                    if (v === null || v === undefined) return null;
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill="hsl(var(--chart-1))"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              {error ? null : "Nenhum dado no período."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
