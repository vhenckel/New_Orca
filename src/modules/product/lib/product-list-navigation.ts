import type { ApiUserRole } from "@/shared/auth/types";
import type {
  AdminProductListItem,
  EstablishmentProductListItem,
} from "@/modules/product/types/product-list";

export const PRODUCT_LIST_SCROLL_KEY = "orca_product_list_scroll";

export function getProductEditHref(
  row: AdminProductListItem | EstablishmentProductListItem,
  role: ApiUserRole | null,
): string {
  if (role === "establishment") {
    const est = row as EstablishmentProductListItem;
    return `/products/${est.establishmentProductId}/edit`;
  }
  return `/products/${row.id}/edit`;
}

/** @deprecated Use getProductEditHref */
export function getProductDetailHref(
  row: AdminProductListItem | EstablishmentProductListItem,
  role: ApiUserRole | null,
): string {
  return getProductEditHref(row, role);
}

export function saveProductListScroll(scrollTop: number): void {
  try {
    sessionStorage.setItem(PRODUCT_LIST_SCROLL_KEY, String(scrollTop));
  } catch {
    // ignore
  }
}

export function restoreProductListScroll(container: HTMLElement | null): void {
  if (!container) return;
  try {
    const raw = sessionStorage.getItem(PRODUCT_LIST_SCROLL_KEY);
    if (!raw) return;
    const top = Number(raw);
    if (!Number.isFinite(top)) return;
    container.scrollTop = top;
    sessionStorage.removeItem(PRODUCT_LIST_SCROLL_KEY);
  } catch {
    // ignore
  }
}
