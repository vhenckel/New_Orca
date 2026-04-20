/** Dados mock para a tela Análises (substituíveis por API). */

export const ANALYTICS_INSIGHTS = [
  {
    id: "savings",
    tone: "amber" as const,
    titleKey: "modules.quotation.analytics.insights.savings.title",
    bodyKey: "modules.quotation.analytics.insights.savings.body",
  },
  {
    id: "prices",
    tone: "rose" as const,
    titleKey: "modules.quotation.analytics.insights.prices.title",
    bodyKey: "modules.quotation.analytics.insights.prices.body",
  },
  {
    id: "concentration",
    tone: "yellow" as const,
    titleKey: "modules.quotation.analytics.insights.concentration.title",
    bodyKey: "modules.quotation.analytics.insights.concentration.body",
  },
  {
    id: "response",
    tone: "sky" as const,
    titleKey: "modules.quotation.analytics.insights.response.title",
    bodyKey: "modules.quotation.analytics.insights.response.body",
  },
];

export const ANALYTICS_OPTIMIZATION = [
  {
    id: "1",
    categoryKey: "modules.quotation.analytics.optimization.cat.beverages",
    titleKey: "modules.quotation.analytics.optimization.row1.title",
    bodyKey: "modules.quotation.analytics.optimization.row1.body",
    impactKey: "modules.quotation.analytics.optimization.row1.impact",
    impactVariant: "success" as const,
  },
  {
    id: "2",
    categoryKey: "modules.quotation.analytics.optimization.cat.meats",
    titleKey: "modules.quotation.analytics.optimization.row2.title",
    bodyKey: "modules.quotation.analytics.optimization.row2.body",
    impactKey: "modules.quotation.analytics.optimization.row2.impact",
    impactVariant: "success" as const,
  },
  {
    id: "3",
    categoryKey: "modules.quotation.analytics.optimization.cat.produce",
    titleKey: "modules.quotation.analytics.optimization.row3.title",
    bodyKey: "modules.quotation.analytics.optimization.row3.body",
    impactKey: "modules.quotation.analytics.optimization.row3.impact",
    impactVariant: "success" as const,
  },
  {
    id: "4",
    categoryKey: "modules.quotation.analytics.optimization.cat.general",
    titleKey: "modules.quotation.analytics.optimization.row4.title",
    bodyKey: "modules.quotation.analytics.optimization.row4.body",
    impactKey: "modules.quotation.analytics.optimization.row4.impact",
    impactVariant: "danger" as const,
  },
];

export const PRICE_VARIATION = [
  { nameKey: "modules.quotation.analytics.prices.products.picanha", pct: 14.2, attention: true },
  { nameKey: "modules.quotation.analytics.prices.products.oil", pct: 12.1, attention: true },
  { nameKey: "modules.quotation.analytics.prices.products.shrimp", pct: 11.4, attention: true },
  { nameKey: "modules.quotation.analytics.prices.products.cheese", pct: 7.8, attention: false },
  { nameKey: "modules.quotation.analytics.prices.products.wine", pct: 5.2, attention: false },
  { nameKey: "modules.quotation.analytics.prices.products.tomato", pct: -3.1, attention: false },
  { nameKey: "modules.quotation.analytics.prices.products.onion", pct: -6.4, attention: false },
  { nameKey: "modules.quotation.analytics.prices.products.chicken", pct: -8.2, attention: false },
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
    productKey: "modules.quotation.analytics.losses.rows.picanha",
    paid: "R$ 89,90",
    cheapest: "R$ 84,50",
    qty: 60,
    loss: "R$ 324",
  },
  {
    productKey: "modules.quotation.analytics.losses.rows.oil",
    paid: "R$ 42,00",
    cheapest: "R$ 36,90",
    qty: 24,
    loss: "R$ 122",
  },
  {
    productKey: "modules.quotation.analytics.losses.rows.shrimp",
    paid: "R$ 118,00",
    cheapest: "R$ 112,40",
    qty: 12,
    loss: "R$ 67",
  },
  {
    productKey: "modules.quotation.analytics.losses.rows.cheese",
    paid: "R$ 56,50",
    cheapest: "R$ 54,20",
    qty: 18,
    loss: "R$ 41",
  },
];

export const DEPENDENCY_PIE = [
  { nameKey: "modules.quotation.analytics.dependency.slice1", value: 65, fill: "#ef4444" },
  { nameKey: "modules.quotation.analytics.dependency.slice2", value: 14, fill: "#3b82f6" },
  { nameKey: "modules.quotation.analytics.dependency.slice3", value: 11, fill: "#22c55e" },
  { nameKey: "modules.quotation.analytics.dependency.slice4", value: 6, fill: "#f59e0b" },
  { nameKey: "modules.quotation.analytics.dependency.slice5", value: 4, fill: "#64748b" },
];

export const DEPENDENCY_CONCENTRATION = [
  { nameKey: "modules.quotation.analytics.dependency.row1", pct: 65, tone: "danger" as const },
  { nameKey: "modules.quotation.analytics.dependency.row2", pct: 14, tone: "primary" as const },
  { nameKey: "modules.quotation.analytics.dependency.row3", pct: 11, tone: "success" as const },
  { nameKey: "modules.quotation.analytics.dependency.row4", pct: 6, tone: "warning" as const },
  { nameKey: "modules.quotation.analytics.dependency.row5", pct: 4, tone: "muted" as const },
];

export const SUPPLIER_RANKING = [
  { rank: 1, nameKey: "modules.quotation.analytics.ranking.s1", preco: 92, resposta: 88, participacao: 78, score: 92 },
  { rank: 2, nameKey: "modules.quotation.analytics.ranking.s2", preco: 85, resposta: 95, participacao: 82, score: 90 },
  { rank: 3, nameKey: "modules.quotation.analytics.ranking.s3", preco: 72, resposta: 80, participacao: 94, score: 83 },
  { rank: 4, nameKey: "modules.quotation.analytics.ranking.s4", preco: 68, resposta: 74, participacao: 70, score: 78 },
  { rank: 5, nameKey: "modules.quotation.analytics.ranking.s5", preco: 58, resposta: 42, participacao: 55, score: 66 },
];

export const FREQUENCY_TOP = [
  { nameKey: "modules.quotation.analytics.frequency.p1", qty: 28 },
  { nameKey: "modules.quotation.analytics.frequency.p2", qty: 24 },
  { nameKey: "modules.quotation.analytics.frequency.p3", qty: 18 },
  { nameKey: "modules.quotation.analytics.frequency.p4", qty: 16 },
  { nameKey: "modules.quotation.analytics.frequency.p5", qty: 14 },
];

export const ABC_CLASSES = [
  {
    clazz: "A" as const,
    priorityKey: "modules.quotation.analytics.abc.high",
    total: "R$ 42,4k",
    items: [
      { nameKey: "modules.quotation.analytics.abc.a1", value: "R$ 18.400" },
      { nameKey: "modules.quotation.analytics.abc.a2", value: "R$ 14.200" },
      { nameKey: "modules.quotation.analytics.abc.a3", value: "R$ 9.800" },
    ],
  },
  {
    clazz: "B" as const,
    priorityKey: "modules.quotation.analytics.abc.mid",
    total: "R$ 15,4k",
    items: [
      { nameKey: "modules.quotation.analytics.abc.b1", value: "R$ 6.400" },
      { nameKey: "modules.quotation.analytics.abc.b2", value: "R$ 5.200" },
      { nameKey: "modules.quotation.analytics.abc.b3", value: "R$ 3.800" },
    ],
  },
  {
    clazz: "C" as const,
    priorityKey: "modules.quotation.analytics.abc.low",
    total: "R$ 3,1k",
    items: [
      { nameKey: "modules.quotation.analytics.abc.c1", value: "R$ 1.900" },
      { nameKey: "modules.quotation.analytics.abc.c2", value: "R$ 820" },
      { nameKey: "modules.quotation.analytics.abc.c3", value: "R$ 410" },
    ],
  },
];

export const CATEGORY_SPEND_VS_SAVE = [
  { categoryKey: "modules.quotation.analytics.categories.carnes", gasto: 32000, economia: 2100 },
  { categoryKey: "modules.quotation.analytics.categories.hortifruti", gasto: 18000, economia: 2800 },
  { categoryKey: "modules.quotation.analytics.categories.bebidas", gasto: 24000, economia: 900 },
  { categoryKey: "modules.quotation.analytics.categories.laticinios", gasto: 14000, economia: 1500 },
  { categoryKey: "modules.quotation.analytics.categories.mercearia", gasto: 9200, economia: 2200 },
];

export const RESPONSE_TIME_ROWS = [
  { nameKey: "modules.quotation.analytics.response.t1", hours: 4, warn: false },
  { nameKey: "modules.quotation.analytics.response.t2", hours: 8, warn: false },
  { nameKey: "modules.quotation.analytics.response.t3", hours: 14, warn: false },
  { nameKey: "modules.quotation.analytics.response.t4", hours: 22, warn: false },
  { nameKey: "modules.quotation.analytics.response.t5", hours: 55, warn: true },
];

export const RESPONSE_RATE_TREND = [
  { month: "Jan", rate: 72 },
  { month: "Fev", rate: 75 },
  { month: "Mar", rate: 81 },
  { month: "Abr", rate: 76 },
  { month: "Mai", rate: 84 },
  { month: "Jun", rate: 88 },
];
