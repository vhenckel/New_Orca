import {
  parseLocalDateInput,
  startOfTomorrowLocal,
} from "@/modules/supplier/quotation/lib/local-date-input";
import {
  getItemPriceLineKeys,
  parseMoneyBRL,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import type {
  SupplierQuotationAlternativeLine,
  SupplierQuotationCommercialTerms,
} from "@/modules/supplier/quotation/lib/supplier-quotation-autostore";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";

export type SendQuotationValidationField =
  | "paymentMethod"
  | "paymentDeadline"
  | "delivery"
  | "quotationValidUntil"
  | "items";

export interface SendQuotationValidationError {
  field: SendQuotationValidationField;
  messageKey: string;
}

export interface SendQuotationValidationResult {
  valid: boolean;
  errors: SendQuotationValidationError[];
  firstInvalidField: SendQuotationValidationField | null;
}

type ResponseState = Record<string, { unitPrice: string; customBrand?: string; observation?: string }>;

function hasValidQuotedItem(
  items: SupplierQuotationDetailItem[],
  responses: ResponseState,
  alternativeLines: SupplierQuotationAlternativeLine[],
): boolean {
  for (const item of items) {
    if (item.isBlocked) continue;
    for (const lineKey of getItemPriceLineKeys(item)) {
      const value = parseMoneyBRL(responses[lineKey]?.unitPrice ?? "");
      if (value !== null && value >= 0.01) return true;
    }
  }

  for (const alt of alternativeLines) {
    const parent = items.find((item) => item.id === alt.parentItemId);
    if (!parent || parent.isBlocked) continue;
    const value = parseMoneyBRL(responses[alt.id]?.unitPrice ?? "");
    if (value !== null && value >= 0.01) return true;
  }

  return false;
}

export function validateSendQuotation(input: {
  commercialTerms: SupplierQuotationCommercialTerms;
  items: SupplierQuotationDetailItem[];
  responses: ResponseState;
  alternativeLines: SupplierQuotationAlternativeLine[];
}): SendQuotationValidationResult {
  const errors: SendQuotationValidationError[] = [];

  if (!input.commercialTerms.paymentMethod.trim()) {
    errors.push({
      field: "paymentMethod",
      messageKey: "modules.supplierPortal.quotation.detail.validation.paymentMethodRequired",
    });
  }

  if (!input.commercialTerms.paymentDeadline.trim()) {
    errors.push({
      field: "paymentDeadline",
      messageKey: "modules.supplierPortal.quotation.detail.validation.paymentDeadlineRequired",
    });
  }

  if (!input.commercialTerms.delivery.trim()) {
    errors.push({
      field: "delivery",
      messageKey: "modules.supplierPortal.quotation.detail.validation.deliveryRequired",
    });
  }

  if (!input.commercialTerms.quotationValidUntil) {
    errors.push({
      field: "quotationValidUntil",
      messageKey: "modules.supplierPortal.quotation.detail.validation.validityRequired",
    });
  } else {
    const validity = parseLocalDateInput(input.commercialTerms.quotationValidUntil);
    if (!validity || validity < startOfTomorrowLocal()) {
      errors.push({
        field: "quotationValidUntil",
        messageKey: "modules.supplierPortal.quotation.detail.validation.validityFuture",
      });
    }
  }

  if (!hasValidQuotedItem(input.items, input.responses, input.alternativeLines)) {
    errors.push({
      field: "items",
      messageKey: "modules.supplierPortal.quotation.detail.toastMissingItems",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    firstInvalidField: errors[0]?.field ?? null,
  };
}
