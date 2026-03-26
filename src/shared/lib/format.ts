const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function isUsableNumber(value: number | null | undefined): value is number {
  return value != null && typeof value === "number" && !Number.isNaN(value);
}

export function formatCurrency(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return "-";
  return brlFormatter.format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (!isUsableNumber(value)) return "-";
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

export function formatPercentChange(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return "-";
  const signal = value >= 0 ? "+" : "";
  if (Number.isInteger(value)) return `${signal}${value}%`;
  return `${signal}${value.toFixed(2).replace(".", ",")}%`;
}

export function formatPp(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return "-";
  const signal = value >= 0 ? "+" : "";
  return `${signal}${value.toFixed(2).replace(".", ",")}pp`;
}

/** CPF: 000.000.000-00 (11 dígitos). */
export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf || cpf === "0") return "-";
  const d = String(cpf).replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** CNPJ: 00.000.000/0000-00 (14 dígitos). */
export function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj || cnpj === "0") return "-";
  const d = String(cnpj).replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** CPF/CNPJ: escolhe formato pelo tamanho; fallback para valor original. */
export function formatDocument(doc: string | null | undefined): string {
  if (!doc || doc === "0") return "-";
  const d = String(doc).replace(/\D/g, "");
  if (d.length === 11) return formatCpf(d);
  if (d.length === 14) return formatCnpj(d);
  return doc;
}
