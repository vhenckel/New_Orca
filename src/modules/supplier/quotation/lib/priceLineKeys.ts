import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/data/supplierQuotationMocks";

type ResponseSlice = { unitPrice: string; customBrand?: string } | undefined;

export function parseMoneyBRL(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withoutThousands = trimmed.replace(/\./g, "");
  const normalized = withoutThousands.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || Number.isNaN(n)) return null;
  return n;
}

/**
 * Uma chave de estado de preço por linha. Com `requestedBrands`, formato `{itemId}::b{index}`;
 * caso contrário uma única chave `itemId`.
 */
export function getItemPriceLineKeys(item: SupplierQuotationDetailItem): string[] {
  const n = item.requestedBrands?.length ?? 0;
  if (n > 0) {
    return item.requestedBrands!.map((_, i) => `${item.id}::b${i}`);
  }
  return [item.id];
}

/** Rótulo de marca fixo para a linha; `undefined` = sem marca (input livre em `item.id`). */
export function getFixedBrandLabelForLine(
  item: SupplierQuotationDetailItem,
  lineKey: string,
): string | undefined {
  const n = item.requestedBrands?.length ?? 0;
  if (n > 0) {
    const m = new RegExp(`^${escapeRegExp(item.id)}::b(\\d+)$`).exec(lineKey);
    if (m) {
      const idx = Number(m[1]);
      if (Number.isInteger(idx) && idx >= 0 && idx < n) {
        return item.requestedBrands![idx];
      }
    }
  }
  if (lineKey === item.id && item.requestedBrand) {
    return item.requestedBrand;
  }
  return undefined;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createLineResponsesInitial(
  items: SupplierQuotationDetailItem[],
): Record<string, { unitPrice: string; customBrand?: string }> {
  const state: Record<string, { unitPrice: string; customBrand?: string }> = {};
  for (const item of items) {
    const lineKeys = getItemPriceLineKeys(item);
    const defaultPrice =
      item.unitPrice != null ? item.unitPrice.toFixed(2).replace(".", ",") : "";
    lineKeys.forEach((key, i) => {
      state[key] = {
        unitPrice: i === 0 && defaultPrice ? defaultPrice : "",
        customBrand: "",
      };
    });
  }
  return state;
}

export function itemHasAnyPricedLine(
  item: SupplierQuotationDetailItem,
  responses: Record<string, ResponseSlice>,
): boolean {
  for (const k of getItemPriceLineKeys(item)) {
    if (parseMoneyBRL(responses[k]?.unitPrice ?? "") != null) return true;
  }
  return false;
}

/**
 * Contribuição para total estimado: max(preço×qtd) entre as linhas do item (evita somar N marcas do mesmo pedido).
 */
export function getItemMaxLineSubtotalBRL(
  item: SupplierQuotationDetailItem,
  responses: Record<string, ResponseSlice>,
): number {
  let max = 0;
  for (const k of getItemPriceLineKeys(item)) {
    const p = parseMoneyBRL(responses[k]?.unitPrice ?? "");
    if (p === null) continue;
    const sub = p * item.quantity;
    if (sub > max) max = sub;
  }
  return max;
}
