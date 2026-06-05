import {
  Activity,
  AlertTriangle,
  CircleDollarSign,
  Store,
  TrendingDown,
  Truck,
  UserPlus,
} from "lucide-react";

import type {
  AdminKpiItem,
  AdminPlanSummary,
  BaseGrowthPoint,
  BillingForecast,
  MrrEvolutionPoint,
  OperationalAlert,
  QuotationActivityPoint,
  RecentRegistration,
  RestaurantStatusItem,
  TopCityItem,
} from "@/modules/admin/dashboard/types";

export const ADMIN_PLAN_SUMMARY: AdminPlanSummary[] = [
  { label: "Plano único", value: "R$ 299,99 /restaurante/mês" },
  { label: "ARR", value: "R$ 1382.4k" },
];

export const ADMIN_DASHBOARD_KPIS: AdminKpiItem[] = [
  {
    label: "Restaurantes ativos",
    value: "384",
    variation: "+18",
    variationTone: "positive",
    icon: Store,
  },
  {
    label: "Fornecedores cadastrados",
    value: "1.247",
    variation: "+62",
    variationTone: "positive",
    icon: Truck,
  },
  {
    label: "MRR estimado",
    value: "R$ 115.196",
    variation: "+5,2%",
    variationTone: "positive",
    icon: CircleDollarSign,
    highlighted: true,
  },
  {
    label: "Churn mensal",
    value: "2",
    variation: "-0,6 p.p.",
    variationTone: "positive",
    icon: TrendingDown,
  },
];

export const MRR_EVOLUTION_SERIES: MrrEvolutionPoint[] = [
  { month: "Nov", mrr: 92000, newRevenue: 12000, churn: 4000 },
  { month: "Dez", mrr: 98000, newRevenue: 14000, churn: 3800 },
  { month: "Jan", mrr: 102000, newRevenue: 11000, churn: 4200 },
  { month: "Fev", mrr: 108000, newRevenue: 13000, churn: 3900 },
  { month: "Mar", mrr: 112000, newRevenue: 12500, churn: 4100 },
  { month: "Abr", mrr: 115196, newRevenue: 13200, churn: 3800 },
];

export const BILLING_FORECAST: BillingForecast = {
  nextMonth: { label: "Próximo mês", value: "R$ 124.4k", change: "+8,0% vs atual" },
  nextQuarter: { label: "Próx. trimestre", value: "R$ 392k" },
  nextYear: { label: "Próx. 12 meses", value: "R$ 1866k" },
  averageTicket: "R$ 299,99",
  estimatedLtv: "R$ 12.500",
};

export const BASE_GROWTH_SERIES: BaseGrowthPoint[] = [
  { month: "Nov", restaurants: 320, suppliers: 980 },
  { month: "Dez", restaurants: 335, suppliers: 1020 },
  { month: "Jan", restaurants: 348, suppliers: 1080 },
  { month: "Fev", restaurants: 362, suppliers: 1140 },
  { month: "Mar", restaurants: 375, suppliers: 1200 },
  { month: "Abr", restaurants: 384, suppliers: 1247 },
];

export const QUOTATION_ACTIVITY_SERIES: QuotationActivityPoint[] = [
  { week: "Sem 1", created: 380, responded: 340 },
  { week: "Sem 2", created: 410, responded: 368 },
  { week: "Sem 3", created: 425, responded: 382 },
  { week: "Sem 4", created: 437, responded: 392 },
];

export const QUOTATION_RESPONSE_RATE = "89,7%";

export const RESTAURANT_STATUS_BREAKDOWN: RestaurantStatusItem[] = [
  { status: "Ativos", count: 384, color: "hsl(var(--chart-1))" },
  { status: "Trial", count: 42, color: "hsl(var(--chart-4))" },
  { status: "Inadimplentes", count: 11, color: "hsl(var(--destructive))" },
  { status: "Cancelados (30d)", count: 9, color: "hsl(var(--muted-foreground))" },
];

export const TOP_CITIES: TopCityItem[] = [
  { city: "São Paulo", count: 138 },
  { city: "Rio de Janeiro", count: 72 },
  { city: "Belo Horizonte", count: 51 },
  { city: "Curitiba", count: 46 },
  { city: "Porto Alegre", count: 41 },
];

export const RECENT_REGISTRATIONS: RecentRegistration[] = [
  {
    id: "1",
    name: "Trattoria Bella Napoli",
    location: "São Paulo, SP",
    type: "restaurant",
    registeredAt: "hoje",
  },
  {
    id: "2",
    name: "Distribuidora Vale Verde",
    location: "Campinas, SP",
    type: "supplier",
    registeredAt: "hoje",
  },
  {
    id: "3",
    name: "Bar do Zeca",
    location: "Rio de Janeiro, RJ",
    type: "restaurant",
    registeredAt: "ontem",
  },
  {
    id: "4",
    name: "Atacado Sul Minas",
    location: "Belo Horizonte, MG",
    type: "supplier",
    registeredAt: "há 2 dias",
  },
  {
    id: "5",
    name: "Cantina Nonna Rosa",
    location: "Curitiba, PR",
    type: "restaurant",
    registeredAt: "há 2 dias",
  },
];

export const OPERATIONAL_ALERTS: OperationalAlert[] = [
  {
    id: "1",
    message: "11 restaurantes com pagamento atrasado — R$ 3.299,89 em risco",
    tone: "danger",
    icon: AlertTriangle,
  },
  {
    id: "2",
    message: "Pico de uso: 437 cotações criadas na última semana (+8,7%)",
    tone: "info",
    icon: Activity,
  },
  {
    id: "3",
    message: "42 restaurantes em trial — 18 finalizam nos próximos 7 dias",
    tone: "warning",
    icon: UserPlus,
  },
];

export const ADMIN_DASHBOARD_HEADER = {
  badge: "ADMIN",
  title: "Painel do Orca",
  subtitle: "Saúde do SaaS, crescimento e receita",
};
