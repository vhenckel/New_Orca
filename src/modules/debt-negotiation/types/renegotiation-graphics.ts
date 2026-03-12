/** Item bruto da API de graphics (sem cor). Campos: name, amount, percentage. */
export interface RenegotiationGraphicItem {
  name: string;
  amount: number;
  percentage: number;
}

/** Resposta da API /trinity/analytics/renegotiation/view/graphics. Donuts: idade da dívida, valor, faixa etária dos devedores. */
export interface RenegotiationGraphicsResponse {
  debtAge?: RenegotiationGraphicItem[];
  debtValue?: RenegotiationGraphicItem[];
  debtorsAge?: RenegotiationGraphicItem[];
}

export interface RenegotiationGraphicsParams {
  startDate: string;
  endDate: string;
  companyId: number;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

/** Formato do DonutCard: name, value, color. */
export interface DonutSeriesItem {
  name: string;
  value: number;
  color: string;
}

/** Converte itens da API (name, amount) em formato do DonutCard (name, value, color). labelFn opcional para traduzir name. Ignora itens com amount zerado. */
export function toDonutSeries(
  items: RenegotiationGraphicItem[] | undefined,
  labelFn?: (apiName: string) => string
): DonutSeriesItem[] {
  if (!items?.length) return [];
  const filtered = items.filter((item) => item.amount > 0);
  return filtered.map((item, i) => ({
    name: labelFn ? labelFn(item.name) : item.name,
    value: item.amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}
