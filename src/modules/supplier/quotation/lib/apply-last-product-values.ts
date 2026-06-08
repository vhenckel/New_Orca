import {
  getFixedBrandLabelForLine,
  getItemPriceLineKeys,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import type { LastProductValue } from "@/modules/supplier/quotation/types/quotation-api";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";

type ResponseState = Record<string, { unitPrice: string; customBrand?: string; observation?: string }>;

function formatMoneyBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function findValueForLine(
  item: SupplierQuotationDetailItem,
  lineKey: string,
  values: LastProductValue[],
): number | null {
  const brandLabel = getFixedBrandLabelForLine(item, lineKey);
  if (brandLabel) {
    const match = values.find(
      (entry) => entry.budgetProductId === item.id && entry.brandName === brandLabel,
    );
    return match?.value ?? null;
  }

  const matches = values.filter((entry) => entry.budgetProductId === item.id);
  if (matches.length === 1) return matches[0]?.value ?? null;
  return null;
}

export function applyLastProductValues(
  items: SupplierQuotationDetailItem[],
  responses: ResponseState,
  values: LastProductValue[],
): ResponseState {
  if (values.length === 0) return responses;

  const next = { ...responses };
  for (const item of items) {
    if (item.isBlocked) continue;
    for (const lineKey of getItemPriceLineKeys(item)) {
      const value = findValueForLine(item, lineKey, values);
      if (value === null) continue;
      next[lineKey] = {
        ...next[lineKey],
        unitPrice: formatMoneyBRL(value),
      };
    }
  }
  return next;
}
