import {
  getFixedBrandLabelForLine,
  getItemPriceLineKeys,
  parseMoneyBRL,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import type { OpenQuotationStatus } from "@/modules/supplier/quotation/types/open-quotation";
import type {
  SendQuotationItemPayload,
  SendQuotationPayload,
  QuotationPackagingUnit,
} from "@/modules/supplier/quotation/types/quotation-api";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";

type ResponseState = Record<string, { unitPrice: string; customBrand?: string }>;

interface AlternativeLine {
  id: string;
  parentItemId: string;
  brand: string;
  packagingAmount: string;
  packagingUnit: string;
}

interface BuildSendQuotationPayloadInput {
  status: OpenQuotationStatus;
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
  return "Qualquer Marca";
}

export function buildSendQuotationPayload(
  input: BuildSendQuotationPayloadInput,
): SendQuotationPayload {
  const items: SendQuotationItemPayload[] = [];

  for (const item of input.items) {
    for (const lineKey of getItemPriceLineKeys(item)) {
      const value = parseMoneyBRL(input.responses[lineKey]?.unitPrice ?? "");
      if (value === null || value <= 0) continue;
      items.push({
        productId: item.productId,
        brandName: resolveBrandName(item, lineKey, input.responses),
        value,
        observation: null,
      });
    }
  }

  for (const alt of input.alternativeLines) {
    const parent = input.items.find((i) => i.id === alt.parentItemId);
    if (!parent) continue;
    const value = parseMoneyBRL(input.responses[alt.id]?.unitPrice ?? "");
    if (value === null || value <= 0) continue;
    items.push({
      productId: parent.productId,
      brandName: alt.brand,
      value,
      packagingUnit: toPackagingUnit(alt.packagingAmount, alt.packagingUnit),
      observation: null,
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
    const date = new Date(input.expirationDate);
    if (!Number.isNaN(date.getTime())) {
      payload.expirationDate = date.toISOString();
    }
  }

  if (items.length > 0) {
    payload.items = items;
  }

  return payload;
}
