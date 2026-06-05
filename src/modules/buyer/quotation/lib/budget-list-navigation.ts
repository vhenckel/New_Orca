import type { BudgetListItem } from "@/modules/buyer/quotation/types/budget";

export const BUDGET_LIST_SCROLL_KEY = "orca_budget_list_scroll";

export function getCreateBudgetPath(editId?: string | null): string {
  if (editId) return `/quotations/new?edit=${editId}`;
  return "/quotations/new";
}

export function getCreateBudgetProductsPath(editId?: string | null): string {
  if (editId) return `/quotations/new/products?edit=${editId}`;
  return "/quotations/new/products";
}

export function getBudgetRowHref(budget: BudgetListItem): string {
  if (budget.status === "saved") {
    return getCreateBudgetPath(budget.id);
  }
  return `/quotations/${budget.id}`;
}

export function canDeleteBudget(budget: BudgetListItem): boolean {
  return budget.status === "saved";
}

export function saveBudgetListScroll(scrollTop: number): void {
  try {
    sessionStorage.setItem(BUDGET_LIST_SCROLL_KEY, String(scrollTop));
  } catch {
    // ignore
  }
}

export function restoreBudgetListScroll(container: HTMLElement | null): void {
  if (!container) return;
  try {
    const raw = sessionStorage.getItem(BUDGET_LIST_SCROLL_KEY);
    if (!raw) return;
    const top = Number(raw);
    if (!Number.isFinite(top)) return;
    container.scrollTop = top;
    sessionStorage.removeItem(BUDGET_LIST_SCROLL_KEY);
  } catch {
    // ignore
  }
}
