export const SUPPLIER_QUOTATION_LIST_SCROLL_KEY = "orca_supplier_quotation_list_scroll";

export function getSupplierQuotationRowHref(quotationId: string): string {
  return `/supplier/quotations/${quotationId}`;
}

export function getMobileSupplierQuotationRowHref(quotationId: string): string {
  return `/m/supplier/quotations/${quotationId}`;
}

export function saveSupplierQuotationListScroll(scrollTop: number): void {
  try {
    sessionStorage.setItem(SUPPLIER_QUOTATION_LIST_SCROLL_KEY, String(scrollTop));
  } catch {
    // ignore
  }
}

export function restoreSupplierQuotationListScroll(container: HTMLElement | null): void {
  if (!container) return;
  try {
    const raw = sessionStorage.getItem(SUPPLIER_QUOTATION_LIST_SCROLL_KEY);
    if (!raw) return;
    const top = Number(raw);
    if (!Number.isFinite(top)) return;
    container.scrollTop = top;
    sessionStorage.removeItem(SUPPLIER_QUOTATION_LIST_SCROLL_KEY);
  } catch {
    // ignore
  }
}
