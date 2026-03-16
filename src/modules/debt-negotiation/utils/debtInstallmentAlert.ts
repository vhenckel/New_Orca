import type { DealItem } from "@/modules/debt-negotiation/types/debt-detail";

export function hasPartialPaidOverdueInstallments(items: DealItem[] | undefined): boolean {
  if (!items?.length) return false;

  const now = Date.now();
  const hasPaidInstallment = items.some((item) => Boolean(item.paidAt));
  const hasOverdueOpenInstallment = items.some((item) => {
    if (item.paidAt) return false;
    const dueAt = new Date(item.dueAt).getTime();
    return !Number.isNaN(dueAt) && dueAt < now;
  });

  return hasPaidInstallment && hasOverdueOpenInstallment;
}
