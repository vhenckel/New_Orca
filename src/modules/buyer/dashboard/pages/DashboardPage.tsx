import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, CircleDollarSign, ShoppingCart, Users2 } from "lucide-react";
import { useMemo } from "react";
import { useQueryStates } from "nuqs";

import { dashboardDateFilterParsers } from "@/modules/buyer/dashboard/lib/dashboard-date-filters";
import { DashboardPageLayout, KpiCard } from "@/shared/components/dashboard-layout";
import { getCurrentMonthToTodayRange } from "@/shared/lib/date-range";
import { CHART_COLORS, OrcaLineChart, orcaTooltipContentStyle } from "@/shared/charts";
import {
  actionCardClass,
  quotationBadgeClass,
} from "@/shared/lib/status-tones";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

const kpis = [
  {
    label: "Total em compras",
    value: "R$ 87.450",
    trend: "+ 12,6% vs mês anterior",
    trendTone: "positive" as const,
    icon: CircleDollarSign,
  },
  {
    label: "Economia gerada",
    value: "R$ 8.320",
    trend: "+ 28,1% vs mês anterior",
    trendTone: "positive" as const,
    icon: Activity,
  },
  {
    label: "Pedidos este mês",
    value: "142",
    trend: "+ 8% vs mês anterior",
    trendTone: "positive" as const,
    icon: ShoppingCart,
  },
  {
    label: "Fornecedores ativos",
    value: "28",
    trend: "- 2 vs mês anterior",
    trendTone: "negative" as const,
    icon: Users2,
  },
];

const monthlyData = [
  { month: "Jan", spend: 62000, saving: 3500 },
  { month: "Fev", spend: 59000, saving: 3700 },
  { month: "Mar", spend: 72000, saving: 4200 },
  { month: "Abr", spend: 66000, saving: 4100 },
  { month: "Mai", spend: 78000, saving: 4600 },
  { month: "Jun", spend: 87450, saving: 5200 },
];

const categoryData = [
  { name: "Carnes", value: 35, color: CHART_COLORS.primary },
  { name: "Hortifruti", value: 25, color: CHART_COLORS.secondary },
  { name: "Bebidas", value: 20, color: CHART_COLORS.tertiary },
  { name: "Secos", value: 12, color: CHART_COLORS.quaternary },
  { name: "Outros", value: 8, color: CHART_COLORS.muted },
];

const topSuppliers = [
  { name: "Distribuidora Central", value: 32000 },
  { name: "Alimentos Premium", value: 24000 },
  { name: "Hortifruti Express", value: 18000 },
  { name: "Bebidas AC", value: 14000 },
];

const quotations = [
  { id: 142, title: "Carnes", date: "09/04/2026", responses: "2/5 respostas", status: "Aberta", statusTone: "info" as const },
  { id: 141, title: "Hortifruti", date: "08/04/2026", responses: "3/4 respostas", status: "Aguardando", statusTone: "warning" as const },
  { id: 140, title: "Bebidas", date: "07/04/2026", responses: "4/4 respostas", status: "Finalizada", statusTone: "success" as const },
  { id: 139, title: "Limpeza", date: "06/04/2026", responses: "4/5 respostas", status: "Finalizada", statusTone: "success" as const },
];

const pendingActions = [
  { id: 1, text: "3 cotações aguardando respostas de fornecedores", tone: "warning" as const },
  { id: 2, text: "Aumento de 15% no preço da Picanha - verificar alternativas", tone: "danger" as const },
  { id: 3, text: "2 pedidos prontos para confirmação", tone: "info" as const },
];

function formatCompactNumber(value: number) {
  return `${Math.round(value / 1000)}k`;
}

export function DashboardPage() {
  const [query] = useQueryStates(dashboardDateFilterParsers);
  const periodLabel = useMemo(() => {
    const defaults = getCurrentMonthToTodayRange();
    const from = query.from ?? defaults.from;
    const to = query.to ?? defaults.to;
    if (!from || !to) return "Visão geral das suas compras e cotações";
    return `Visão geral das suas compras e cotações · ${format(from, "dd/MM/yyyy", { locale: ptBR })} – ${format(to, "dd/MM/yyyy", { locale: ptBR })}`;
  }, [query.from, query.to]);

  return (
    <DashboardPageLayout showPageHeader title="Dashboard" subtitle={periodLabel}>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            trend={item.trend}
            trendTone={item.trendTone}
            icon={item.icon}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evolução da economia (R$)</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <OrcaLineChart
              data={monthlyData}
              xDataKey="month"
              series={[
                {
                  dataKey: "saving",
                  name: "Economia",
                  withArea: true,
                },
                {
                  dataKey: "spend",
                  name: "Gastos",
                  color: CHART_COLORS.muted,
                  withArea: false,
                },
              ]}
              yTickFormatter={formatCompactNumber}
              tooltipFormatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
            />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Economia por categoria</CardTitle>
            <CardDescription>Participação no gasto total</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} contentStyle={orcaTooltipContentStyle()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>
                    {item.name} {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ranking de fornecedores</CardTitle>
            <CardDescription>Por volume de compras</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topSuppliers} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCompactNumber} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} fontSize={11} />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`}
                  contentStyle={orcaTooltipContentStyle()}
                />
                <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
            <button type="button" className="mt-3 text-sm font-medium text-primary hover:underline">
              Ver todos
            </button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cotações recentes</CardTitle>
            <CardDescription>Últimas atividades</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {quotations.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Cotação #{item.id} - {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.date} - {item.responses}
                  </p>
                </div>
                <Badge variant="outline" className={quotationBadgeClass(item.statusTone)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações pendentes</CardTitle>
            <CardDescription>Itens que precisam de sua atenção</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm text-foreground",
                  actionCardClass(action.tone),
                )}
              >
                {action.text}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </DashboardPageLayout>
  );
}
