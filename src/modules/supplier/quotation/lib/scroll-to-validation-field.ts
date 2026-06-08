import type { SendQuotationValidationField } from "@/modules/supplier/quotation/lib/validate-send-quotation";

function findValidationTarget(field: SendQuotationValidationField): HTMLElement | null {
  if (field === "items") {
    return document.querySelector<HTMLElement>('[data-validation-anchor="items"]');
  }
  return document.querySelector<HTMLElement>(`[data-validation-field="${field}"]`);
}

function focusWithin(target: HTMLElement): void {
  if (target.matches("input, textarea, select, button")) {
    target.focus({ preventScroll: true });
    return;
  }
  const focusable = target.querySelector<HTMLElement>("input, textarea, select, button");
  focusable?.focus({ preventScroll: true });
}

export function scrollToValidationField(field: SendQuotationValidationField): void {
  const target = findValidationTarget(field);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  focusWithin(target);
}
