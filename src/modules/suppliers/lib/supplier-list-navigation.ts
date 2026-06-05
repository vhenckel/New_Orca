import type { ApiUserRole } from "@/shared/auth/types";
import type { SupplierListItem } from "@/modules/suppliers/types/supplier-list";

export const SUPPLIER_LIST_SCROLL_KEY = "orca_supplier_list_scroll";

export function getSupplierRowHref(row: SupplierListItem, role: ApiUserRole | null): string {
  if (role === "admin") return `/suppliers/${row.id}/edit`;
  return `/suppliers/${row.id}`;
}

export function saveSupplierListScroll(scrollTop: number): void {
  try {
    sessionStorage.setItem(SUPPLIER_LIST_SCROLL_KEY, String(scrollTop));
  } catch {
    // ignore
  }
}

export function restoreSupplierListScroll(container: HTMLElement | null): void {
  if (!container) return;
  try {
    const raw = sessionStorage.getItem(SUPPLIER_LIST_SCROLL_KEY);
    if (!raw) return;
    const top = Number(raw);
    if (!Number.isFinite(top)) return;
    container.scrollTop = top;
    sessionStorage.removeItem(SUPPLIER_LIST_SCROLL_KEY);
  } catch {
    // ignore
  }
}
