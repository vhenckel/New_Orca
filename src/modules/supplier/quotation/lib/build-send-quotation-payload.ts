import { localDateInputToIso } from "@/modules/supplier/quotation/lib/local-date-input";
import {
  getFixedBrandLabelForLine,
  getItemPriceLineKeys,
  parseMoneyBRL,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import type {
  SendQuotationItemPayload,
  SendQuotationPayload,
  QuotationPackagingUnit,
  SendQuotationStatus,
} from "@/modules/supplier/quotation/types/quotation-api";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";

type ResponseState = Record<string, { unitPrice: string; customBrand?: string; observation?: string }>;

interface AlternativeLine {
  id: string;
  parentItemId: string;
  brand: string;
  packagingAmount: string;
  packagingUnit: string;
}

interface BuildSendQuotationPayloadInput {
  status: SendQuotationStatus;
  items: SupplierQuotationDetailItem[];
  responses: ResponseState;
  alternativeLines: AlternativeLine[];
  paymentMethod: string;
  paymentTerm: string;
  deliveryDeadline: string;
  expirationDate: string;
  observation: string;
}

function toPackagingUnit(amount: string, unit: string): QuotationPackagingUnit | undefined {
  const weight = parseFloat(amount.replace(",", "."));
  if (!amount.trim() || Number.isNaN(weight)) return undefined;
  return { unit, weight };
}

function resolveBrandName(
  item: SupplierQuotationDetailItem,
  lineKey: string,
  responses: ResponseState,
): string {
  const fixed = getFixedBrandLabelForLine(item, lineKey);
  if (fixed) return fixed;
  const custom = responses[lineKey]?.customBrand?.trim();
  if (custom) return custom;
  if (item.brandPlaceholder === "any") return "Qualquer Marca";
  return "Sem Marca";
}

export function buildSendQuotationPayload(
  input: BuildSendQuotationPayloadInput,
): SendQuotationPayload {
  const items: SendQuotationItemPayload[] = [];

  for (const item of input.items) {
    if (item.isBlocked) continue;
    for (const lineKey of getItemPriceLineKeys(item)) {
      const value = parseMoneyBRL(input.responses[lineKey]?.unitPrice ?? "");
      if (value === null || value < 0.01) continue;
      const observation = input.responses[lineKey]?.observation?.trim();
      items.push({
        productId: item.id,
        brandName: resolveBrandName(item, lineKey, input.responses),
        value,
        observation: observation || null,
      });
    }
  }

  for (const alt of input.alternativeLines) {
    const parent = input.items.find((i) => i.id === alt.parentItemId);
    if (!parent || parent.isBlocked) continue;
    const value = parseMoneyBRL(input.responses[alt.id]?.unitPrice ?? "");
    if (value === null || value < 0.01) continue;
    const observation = input.responses[alt.id]?.observation?.trim();
    items.push({
      productId: parent.id,
      brandName: alt.brand,
      value,
      packagingUnit: toPackagingUnit(alt.packagingAmount, alt.packagingUnit),
      observation: observation || null,
    });
  }

  const payload: SendQuotationPayload = {
    status: input.status,
    observation: input.observation || null,
  };

  if (input.paymentMethod.trim()) payload.paymentMethod = input.paymentMethod.trim();
  if (input.paymentTerm.trim()) payload.paymentTerm = input.paymentTerm.trim();
  if (input.deliveryDeadline.trim()) payload.deliveryDeadline = input.deliveryDeadline.trim();
  if (input.expirationDate) {
    const expirationDate = localDateInputToIso(input.expirationDate);
    if (expirationDate) payload.expirationDate = expirationDate;
  }

  if (items.length > 0) {
    payload.items = items;
  }

  return payload;
}
