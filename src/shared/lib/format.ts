const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return brlFormatter.format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

export function formatPercentChange(value: number): string {
  const signal = value >= 0 ? "+" : "";
  if (Number.isInteger(value)) return `${signal}${value}%`;
  return `${signal}${value.toFixed(2).replace(".", ",")}%`;
}

export function formatPp(value: number): string {
  const signal = value >= 0 ? "+" : "";
  return `${signal}${value.toFixed(2).replace(".", ",")}pp`;
}
