import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CircleDollarSign, ShoppingCart, Users2 } from "lucide-react";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const kpis = [
  {
    label: "Total em compras",
    value: "R$ 87.450",
    variation: "+ 12,6%",
    variationTone: "positive" as const,
    icon: CircleDollarSign,
  },
  {
    label: "Economia gerada",
    value: "R$ 8.320",
    variation: "+ 28,1%",
    variationTone: "positive" as const,
    icon: Activity,
  },
  {
    label: "Pedidos este mês",
    value: "142",
    variation: "+ 8%",
    variationTone: "positive" as const,
    icon: ShoppingCart,
  },
  {
    label: "Fornecedores ativos",
    value: "28",
    variation: "- 2",
    variationTone: "negative" as const,
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
  { name: "Carnes", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Hortifruti", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Bebidas", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Secos", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Outros", value: 8, color: "hsl(var(--chart-5))" },
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

function toneBadgeClass(tone: "positive" | "negative") {
  return tone === "positive"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";
}

function quotationBadgeClass(tone: "info" | "warning" | "success") {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function actionCardClass(tone: "warning" | "danger" | "info") {
  if (tone === "danger") return "border-rose-200 bg-rose-50/70";
  if (tone === "warning") return "border-amber-200 bg-amber-50/70";
  return "border-sky-200 bg-sky-50/70";
}

export function DashboardPage() {
  return (
    <DashboardPageLayout showPageHeader title="Dashboard" subtitle="Visão geral das suas compras e cotações">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl">{item.value}</CardTitle>
                  </div>
                  <div className="rounded-md border border-border p-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className={toneBadgeClass(item.variationTone)}>
                  {item.variation}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gastos e economia mensal</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
                />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`}
                  contentStyle={{ borderRadius: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  name="Gastos"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="saving"
                  name="Economia"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição por categoria</CardTitle>
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
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top fornecedores</CardTitle>
            <CardDescription>Por volume de compras</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topSuppliers} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCompactNumber} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} fontSize={11} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cotações recentes</CardTitle>
            <CardDescription>Últimas atividades</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {quotations.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">Cotação #{item.id} - {item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date} - {item.responses}</p>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações pendentes</CardTitle>
            <CardDescription>Itens que precisam de sua atenção</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className={`rounded-md border px-3 py-2 text-sm text-foreground ${actionCardClass(action.tone)}`}
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
