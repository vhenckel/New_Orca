import type { BudgetLineItem } from "@/modules/buyer/quotation/types";

const STORAGE_PREFIX = "@autostore_budget_user=";

export interface CreateBudgetAutostoreSnapshot {
  step: 1 | 2;
  establishmentId: string;
  deadlineDateIso: string | null;
  deadlineTime: string;
  deliveryTime: string;
  observations: string;
  lineItems: Record<string, BudgetLineItem>;
  lineOrder: string[];
}

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function readCreateBudgetAutostore(userId: string): CreateBudgetAutostoreSnapshot | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as CreateBudgetAutostoreSnapshot;
  } catch {
    return null;
  }
}

export function writeCreateBudgetAutostore(
  userId: string,
  snapshot: CreateBudgetAutostoreSnapshot,
): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(snapshot));
  } catch {
    // ignore
  }
}

export function clearCreateBudgetAutostore(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    // ignore
  }
}
