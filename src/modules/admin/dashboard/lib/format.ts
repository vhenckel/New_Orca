export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (value >= 1_000) {
    return `R$ ${Math.round(value / 1_000)}k`;
  }
  return formatCurrency(value);
}

/** Rótulos do eixo Y em gráficos — formato curto e sem decimais em zero. */
export function formatAxisCompactCurrency(value: number): string {
  if (value === 0) return "R$ 0";
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (value >= 1_000) {
    return `R$ ${value / 1_000}k`;
  }
  return `R$ ${value}`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".", ",")}k`;
  }
  return String(value);
}

export function formatCount(value: number): string {
  return value.toLocaleString("pt-BR");
}
