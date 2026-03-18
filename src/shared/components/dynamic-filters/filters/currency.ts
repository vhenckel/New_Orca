export function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyBRL(input: string): number | null {
  const s = input.trim();
  if (!s) return null;

  const cleaned = s.replace(/[R$\s]/g, "");
  if (!cleaned) return null;

  if (cleaned.includes(",")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatCurrencyInputBRL(input: string): string {
  return input.replace(/[^\d,.-]/g, "");
}

