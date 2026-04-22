import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Area,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Activity, AlertTriangle, BarChart3, Clock, LineChart as LineChartIcon, Trophy, Zap } from "lucide-react";

import {
  ABC_CLASSES,
  ACCUMULATED_SAVINGS,
  CATEGORY_SPEND_VS_SAVE,
  DEPENDENCY_CONCENTRATION,
  DEPENDENCY_PIE,
  FREQUENCY_TOP,
  LOST_SAVINGS_ROWS,
  PRICE_VARIATION,
  RESPONSE_RATE_TREND,
  RESPONSE_TIME_ROWS,
  SUPPLIER_RANKING,
  TRENDS_MONTHLY,
} from "@/modules/analytic/data/analyticsMocks";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

function scoreBadgeClass(score: number): string {
  if (score >= 90) return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (score >= 70) return "border-sky-200 bg-sky-50 text-sky-900";
  return "border-amber-200 bg-amber-50 text-amber-950";
}

function barToneClass(tone: (typeof DEPENDENCY_CONCENTRATION)[0]["tone"]): string {
  if (tone === "danger") return "bg-red-500";
  if (tone === "primary") return "bg-sky-500";
  if (tone === "success") return "bg-emerald-500";
  if (tone === "warning") return "bg-amber-500";
  return "bg-slate-500";
}

function DependencyBar({ pct, tone }: { pct: number; tone: (typeof DEPENDENCY_CONCENTRATION)[0]["tone"] }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", barToneClass(tone))} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AnalyticsDeepAnalysis() {
  const { t } = useI18n();

  const pieData = DEPENDENCY_PIE.map((row) => ({
    ...row,
    name: t(row.nameKey),
  }));

  const freqData = FREQUENCY_TOP.map((row) => ({
    qty: row.qty,
    label: t(row.nameKey),
  }));

  const categoryChart = CATEGORY_SPEND_VS_SAVE.map((row) => ({
    cat: t(row.categoryKey),
    gasto: row.gasto / 1000,
    economia: row.economia / 1000,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-5 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold tracking-tight">{t("modules.analytic.deep.title")}</h2>
      </div>

      <Tabs defaultValue="precos" className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-muted/30 p-1">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
            {(
              [
                "precos",
                "perdas",
                "dependencia",
                "fornecedores",
                "frequencia",
                "curva-abc",
                "categorias",
                "resposta",
              ] as const
            ).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-lg px-3 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
              >
                {t(`modules.analytic.tabs.${key}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="precos" className="mt-0 flex flex-col gap-6 outline-none">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t("modules.analytic.prices.variationTitle")}</CardTitle>
              <CardDescription>{t("modules.analytic.prices.variationSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {PRICE_VARIATION.map((row) => {
                const label = t(row.nameKey);
                const positive = row.pct > 0;
                const width = Math.min(100, Math.abs(row.pct) * 5);
                return (
                  <div key={row.nameKey} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className="shrink-0 text-sm font-medium sm:w-44 sm:truncate">{label}</span>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", positive ? "bg-red-500" : "bg-emerald-500")}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "w-16 shrink-0 text-right text-sm font-semibold tabular-nums",
                          positive ? "text-red-600" : "text-emerald-600",
                        )}
                      >
                        {positive ? "+" : ""}
                        {row.pct}%
                      </span>
                      {row.attention ? (
                        <Badge className="shrink-0 border-amber-200 bg-amber-50 text-amber-950">
                          {t("modules.analytic.prices.attention")}
                        </Badge>
                      ) : (
                        <span className="w-16 shrink-0 sm:w-20" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perdas" className="mt-0 outline-none">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-base">{t("modules.analytic.losses.title")}</CardTitle>
                <CardDescription>{t("modules.analytic.losses.subtitle")}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600 tabular-nums">R$ 740</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("modules.analytic.losses.totalLabel")}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("modules.analytic.losses.colProduct")}</TableHead>
                      <TableHead className="text-right">{t("modules.analytic.losses.colPaid")}</TableHead>
                      <TableHead className="text-right">{t("modules.analytic.losses.colCheapest")}</TableHead>
                      <TableHead className="text-right">{t("modules.analytic.losses.colQty")}</TableHead>
                      <TableHead className="text-right">{t("modules.analytic.losses.colLoss")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LOST_SAVINGS_ROWS.map((row) => (
                      <TableRow key={row.productKey}>
                        <TableCell className="font-medium">{t(row.productKey)}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.paid}</TableCell>
                        <TableCell className="text-right font-medium text-emerald-600 tabular-nums">{row.cheapest}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.qty}</TableCell>
                        <TableCell className="text-right font-semibold text-amber-600 tabular-nums">{row.loss}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencia" className="mt-0 outline-none">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{t("modules.analytic.dependency.chartTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`${entry.nameKey}-${i}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="size-4 text-red-500" aria-hidden />
                  {t("modules.analytic.dependency.concentrationTitle")}
                </CardTitle>
                <CardDescription>{t("modules.analytic.dependency.concentrationHint")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {DEPENDENCY_CONCENTRATION.map((row) => (
                  <div key={row.nameKey} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className={cn(row.tone === "danger" && "font-semibold text-red-600")}>{t(row.nameKey)}</span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          row.tone === "danger" ? "text-red-600" : "text-foreground",
                        )}
                      >
                        {row.pct}%
                      </span>
                    </div>
                    <DependencyBar pct={row.pct} tone={row.tone} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fornecedores" className="mt-0 outline-none">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="size-4 text-amber-500" aria-hidden />
                {t("modules.analytic.ranking.title")}
              </CardTitle>
              <CardDescription>{t("modules.analytic.ranking.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>{t("modules.analytic.ranking.colSupplier")}</TableHead>
                      <TableHead>{t("modules.analytic.ranking.colPrice")}</TableHead>
                      <TableHead>{t("modules.analytic.ranking.colResponse")}</TableHead>
                      <TableHead>{t("modules.analytic.ranking.colShare")}</TableHead>
                      <TableHead className="text-right">{t("modules.analytic.ranking.colScore")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SUPPLIER_RANKING.map((row) => (
                      <TableRow key={row.rank}>
                        <TableCell className="tabular-nums text-muted-foreground">{row.rank}</TableCell>
                        <TableCell className="font-medium">{t(row.nameKey)}</TableCell>
                        <TableCell className="min-w-[120px]">
                          <Progress value={row.preco} className="h-2 [&>div]:bg-sky-500" />
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <Progress value={row.resposta} className="h-2 [&>div]:bg-sky-500" />
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <Progress value={row.participacao} className="h-2 [&>div]:bg-sky-500" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={cn("tabular-nums", scoreBadgeClass(row.score))}>
                            {row.score}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequencia" className="mt-0 outline-none">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LineChartIcon className="size-4 text-primary" aria-hidden />
                {t("modules.analytic.frequency.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={freqData} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" domain={[0, 28]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="qty" fill="hsl(221.2 83.2% 53.3%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curva-abc" className="mt-0 outline-none">
          <div className="grid gap-4 md:grid-cols-3">
            {ABC_CLASSES.map((block) => {
              const accent =
                block.clazz === "A"
                  ? "border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/30"
                  : block.clazz === "B"
                    ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30"
                    : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30";
              const letterColor =
                block.clazz === "A"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200"
                  : block.clazz === "B"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";
              return (
                <Card key={block.clazz} className={cn("rounded-2xl border-2 shadow-sm", accent)}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                          letterColor,
                        )}
                      >
                        {block.clazz}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base">
                          {t("modules.analytic.abc.classTitle", { clazz: block.clazz })}
                        </CardTitle>
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t(block.priorityKey)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{block.total}</span>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="flex flex-col divide-y divide-border">
                      {block.items.map((item) => (
                        <li key={item.nameKey} className="flex items-center justify-between gap-2 py-2 text-sm first:pt-0">
                          <span className="min-w-0 truncate">{t(item.nameKey)}</span>
                          <span className="shrink-0 font-medium tabular-nums text-muted-foreground">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="mt-0 outline-none">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t("modules.analytic.categories.chartTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="cat" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}k`} />
                  <Tooltip formatter={(value: number) => `R$ ${(value * 1000).toLocaleString("pt-BR")}`} />
                  <Legend />
                  <Bar dataKey="gasto" fill="hsl(221.2 83.2% 53.3%)" name={t("modules.analytic.categories.legendSpend")} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="economia" fill="#22c55e" name={t("modules.analytic.categories.legendSave")} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resposta" className="mt-0 outline-none">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-4 text-amber-600" aria-hidden />
                  {t("modules.analytic.response.avgTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {RESPONSE_TIME_ROWS.map((row) => {
                  const width = Math.min(100, (row.hours / 60) * 100);
                  return (
                    <div key={row.nameKey} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className={cn(row.warn && "font-medium")}>{t(row.nameKey)}</span>
                        <span className={cn("tabular-nums font-semibold", row.warn ? "text-red-600" : "text-foreground")}>
                          {row.hours}h
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", row.warn ? "bg-red-500" : "bg-sky-500")}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="size-4 text-emerald-600" aria-hidden />
                  {t("modules.analytic.response.rateTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[260px] pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={RESPONSE_RATE_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#22c55e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <section className="flex flex-col gap-3 border-t border-border pt-6" aria-label={t("modules.analytic.trends.sectionTitle")}>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="size-4 text-muted-foreground" aria-hidden />
          {t("modules.analytic.trends.sectionTitle")}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t("modules.analytic.trends.spendTitle")}</CardTitle>
              <CardDescription>{t("modules.analytic.trends.spendSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={TRENDS_MONTHLY} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    domain={[0, "auto"]}
                  />
                  <Tooltip
                    formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="gasto"
                    name={t("modules.analytic.trends.legendSpend")}
                    fill="hsl(221.2 83.2% 53.3% / 0.25)"
                    stroke="hsl(221.2 83.2% 53.3%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="economia"
                    name={t("modules.analytic.trends.legendSave")}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="potencial"
                    name={t("modules.analytic.trends.legendPotential")}
                    stroke="#eab308"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{t("modules.analytic.trends.accumulatedTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ACCUMULATED_SAVINGS} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} domain={[0, "auto"]} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                  <Bar
                    dataKey="value"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name={t("modules.analytic.trends.accumulatedTitle")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
