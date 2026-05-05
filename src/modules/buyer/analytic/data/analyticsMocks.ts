/** Dados mock para a tela Análises (substituíveis por API). */

export const ANALYTICS_INSIGHTS = [
  {
    id: "savings",
    tone: "amber" as const,
    titleKey: "modules.analytic.insights.savings.title",
    bodyKey: "modules.analytic.insights.savings.body",
  },
  {
    id: "prices",
    tone: "rose" as const,
    titleKey: "modules.analytic.insights.prices.title",
    bodyKey: "modules.analytic.insights.prices.body",
  },
  {
    id: "concentration",
    tone: "yellow" as const,
    titleKey: "modules.analytic.insights.concentration.title",
    bodyKey: "modules.analytic.insights.concentration.body",
  },
  {
    id: "response",
    tone: "sky" as const,
    titleKey: "modules.analytic.insights.response.title",
    bodyKey: "modules.analytic.insights.response.body",
  },
];

export const ANALYTICS_OPTIMIZATION = [
  {
    id: "1",
    categoryKey: "modules.analytic.optimization.cat.beverages",
    titleKey: "modules.analytic.optimization.row1.title",
    bodyKey: "modules.analytic.optimization.row1.body",
    impactKey: "modules.analytic.optimization.row1.impact",
    impactVariant: "success" as const,
  },
  {
    id: "2",
    categoryKey: "modules.analytic.optimization.cat.meats",
    titleKey: "modules.analytic.optimization.row2.title",
    bodyKey: "modules.analytic.optimization.row2.body",
    impactKey: "modules.analytic.optimization.row2.impact",
    impactVariant: "success" as const,
  },
  {
    id: "3",
    categoryKey: "modules.analytic.optimization.cat.produce",
    titleKey: "modules.analytic.optimization.row3.title",
    bodyKey: "modules.analytic.optimization.row3.body",
    impactKey: "modules.analytic.optimization.row3.impact",
    impactVariant: "success" as const,
  },
  {
    id: "4",
    categoryKey: "modules.analytic.optimization.cat.general",
    titleKey: "modules.analytic.optimization.row4.title",
    bodyKey: "modules.analytic.optimization.row4.body",
    impactKey: "modules.analytic.optimization.row4.impact",
    impactVariant: "danger" as const,
  },
];

export const PRICE_VARIATION = [
  { nameKey: "modules.analytic.prices.products.picanha", pct: 14.2, attention: true },
  { nameKey: "modules.analytic.prices.products.oil", pct: 12.1, attention: true },
  { nameKey: "modules.analytic.prices.products.shrimp", pct: 11.4, attention: true },
  { nameKey: "modules.analytic.prices.products.cheese", pct: 7.8, attention: false },
  { nameKey: "modules.analytic.prices.products.wine", pct: 5.2, attention: false },
  { nameKey: "modules.analytic.prices.products.tomato", pct: -3.1, attention: false },
  { nameKey: "modules.analytic.prices.products.onion", pct: -6.4, attention: false },
  { nameKey: "modules.analytic.prices.products.chicken", pct: -8.2, attention: false },
];

export const TRENDS_MONTHLY = [
  { month: "Jan", gasto: 82000, economia: 4200, potencial: 7800 },
  { month: "Fev", gasto: 76000, economia: 5100, potencial: 8400 },
  { month: "Mar", gasto: 91000, economia: 4800, potencial: 9100 },
  { month: "Abr", gasto: 88000, economia: 5500, potencial: 8900 },
  { month: "Mai", gasto: 94000, economia: 6100, potencial: 9600 },
  { month: "Jun", gasto: 87200, economia: 6400, potencial: 10200 },
];

export const ACCUMULATED_SAVINGS = [
  { month: "Jan", value: 4200 },
  { month: "Fev", value: 9300 },
  { month: "Mar", value: 14100 },
  { month: "Abr", value: 19600 },
  { month: "Mai", value: 25700 },
  { month: "Jun", value: 32100 },
];

export const LOST_SAVINGS_ROWS = [
  {
    productKey: "modules.analytic.losses.rows.picanha",
    paid: "R$ 89,90",
    cheapest: "R$ 84,50",
    qty: 60,
    loss: "R$ 324",
  },
  {
    productKey: "modules.analytic.losses.rows.oil",
    paid: "R$ 42,00",
    cheapest: "R$ 36,90",
    qty: 24,
    loss: "R$ 122",
  },
  {
    productKey: "modules.analytic.losses.rows.shrimp",
    paid: "R$ 118,00",
    cheapest: "R$ 112,40",
    qty: 12,
    loss: "R$ 67",
  },
  {
    productKey: "modules.analytic.losses.rows.cheese",
    paid: "R$ 56,50",
    cheapest: "R$ 54,20",
    qty: 18,
    loss: "R$ 41",
  },
];

export const DEPENDENCY_PIE = [
  { nameKey: "modules.analytic.dependency.slice1", value: 65, fill: "#ef4444" },
  { nameKey: "modules.analytic.dependency.slice2", value: 14, fill: "#3b82f6" },
  { nameKey: "modules.analytic.dependency.slice3", value: 11, fill: "#22c55e" },
  { nameKey: "modules.analytic.dependency.slice4", value: 6, fill: "#f59e0b" },
  { nameKey: "modules.analytic.dependency.slice5", value: 4, fill: "#64748b" },
];

export const DEPENDENCY_CONCENTRATION = [
  { nameKey: "modules.analytic.dependency.row1", pct: 65, tone: "danger" as const },
  { nameKey: "modules.analytic.dependency.row2", pct: 14, tone: "primary" as const },
  { nameKey: "modules.analytic.dependency.row3", pct: 11, tone: "success" as const },
  { nameKey: "modules.analytic.dependency.row4", pct: 6, tone: "warning" as const },
  { nameKey: "modules.analytic.dependency.row5", pct: 4, tone: "muted" as const },
];

export const SUPPLIER_RANKING = [
  { rank: 1, nameKey: "modules.analytic.ranking.s1", preco: 92, resposta: 88, participacao: 78, score: 92 },
  { rank: 2, nameKey: "modules.analytic.ranking.s2", preco: 85, resposta: 95, participacao: 82, score: 90 },
  { rank: 3, nameKey: "modules.analytic.ranking.s3", preco: 72, resposta: 80, participacao: 94, score: 83 },
  { rank: 4, nameKey: "modules.analytic.ranking.s4", preco: 68, resposta: 74, participacao: 70, score: 78 },
  { rank: 5, nameKey: "modules.analytic.ranking.s5", preco: 58, resposta: 42, participacao: 55, score: 66 },
];

export const FREQUENCY_TOP = [
  { nameKey: "modules.analytic.frequency.p1", qty: 28 },
  { nameKey: "modules.analytic.frequency.p2", qty: 24 },
  { nameKey: "modules.analytic.frequency.p3", qty: 18 },
  { nameKey: "modules.analytic.frequency.p4", qty: 16 },
  { nameKey: "modules.analytic.frequency.p5", qty: 14 },
];

export const ABC_CLASSES = [
  {
    clazz: "A" as const,
    priorityKey: "modules.analytic.abc.high",
    total: "R$ 42,4k",
    items: [
      { nameKey: "modules.analytic.abc.a1", value: "R$ 18.400" },
      { nameKey: "modules.analytic.abc.a2", value: "R$ 14.200" },
      { nameKey: "modules.analytic.abc.a3", value: "R$ 9.800" },
    ],
  },
  {
    clazz: "B" as const,
    priorityKey: "modules.analytic.abc.mid",
    total: "R$ 15,4k",
    items: [
      { nameKey: "modules.analytic.abc.b1", value: "R$ 6.400" },
      { nameKey: "modules.analytic.abc.b2", value: "R$ 5.200" },
      { nameKey: "modules.analytic.abc.b3", value: "R$ 3.800" },
    ],
  },
  {
    clazz: "C" as const,
    priorityKey: "modules.analytic.abc.low",
    total: "R$ 3,1k",
    items: [
      { nameKey: "modules.analytic.abc.c1", value: "R$ 1.900" },
      { nameKey: "modules.analytic.abc.c2", value: "R$ 820" },
      { nameKey: "modules.analytic.abc.c3", value: "R$ 410" },
    ],
  },
];

export const CATEGORY_SPEND_VS_SAVE = [
  { categoryKey: "modules.analytic.categories.carnes", gasto: 32000, economia: 2100 },
  { categoryKey: "modules.analytic.categories.hortifruti", gasto: 18000, economia: 2800 },
  { categoryKey: "modules.analytic.categories.bebidas", gasto: 24000, economia: 900 },
  { categoryKey: "modules.analytic.categories.laticinios", gasto: 14000, economia: 1500 },
  { categoryKey: "modules.analytic.categories.mercearia", gasto: 9200, economia: 2200 },
];

export const RESPONSE_TIME_ROWS = [
  { nameKey: "modules.analytic.response.t1", hours: 4, warn: false },
  { nameKey: "modules.analytic.response.t2", hours: 8, warn: false },
  { nameKey: "modules.analytic.response.t3", hours: 14, warn: false },
  { nameKey: "modules.analytic.response.t4", hours: 22, warn: false },
  { nameKey: "modules.analytic.response.t5", hours: 55, warn: true },
];

export const RESPONSE_RATE_TREND = [
  { month: "Jan", rate: 72 },
  { month: "Fev", rate: 75 },
  { month: "Mar", rate: 81 },
  { month: "Abr", rate: 76 },
  { month: "Mai", rate: 84 },
  { month: "Jun", rate: 88 },
];
