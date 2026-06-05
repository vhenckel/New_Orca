import { formatCurrency } from "@/modules/admin/dashboard/lib/format";
import { formatBrandsLabel, formatPackagingUnit } from "@/modules/buyer/quotation/lib/create-budget-mapper";
import type { BudgetViewProduct } from "@/modules/buyer/quotation/types/view-budget";
import { formatDateTimePtBr } from "@/shared/lib/format-datetime";

export function formatViewBudgetCurrency(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return formatCurrency(value);
}

export function formatViewBudgetDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const formatted = formatDateTimePtBr(iso);
  return formatted || "—";
}

export function formatViewBudgetText(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function formatViewBudgetProductBrands(
  product: Pick<BudgetViewProduct, "brands" | "selectedBrandName">,
  anyBrandLabel: string,
): string {
  if (product.selectedBrandName) return product.selectedBrandName;
  if (product.brands.length === 0) return anyBrandLabel;
  return formatBrandsLabel(
    product.brands.map((b) => b.name),
    3,
  );
}

export function formatViewBudgetPackaging(
  packaging: BudgetViewProduct["packagingUnit"],
): string {
  const formatted = formatPackagingUnit(packaging ?? null);
  return formatted || "—";
}

export function calcCheapestPercentAbove(totalValue: number, differenceCheapest: number): number | null {
  const cheapest = totalValue - differenceCheapest;
  if (!Number.isFinite(cheapest) || cheapest <= 0) return null;
  return ((totalValue / cheapest - 1) * 100);
}

export function formatCheapestPercentAbove(totalValue: number, differenceCheapest: number): string {
  const pct = calcCheapestPercentAbove(totalValue, differenceCheapest);
  if (pct == null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function sumProductQuantities(products: BudgetViewProduct[]): number {
  return products.reduce((acc, p) => acc + (p.quantity || 0), 0);
}

export function calcResponseProgress(responseCount: number, totalSuppliers: number): {
  fraction: string;
  percent: number;
} {
  if (totalSuppliers <= 0) {
    return { fraction: `${responseCount}/0`, percent: 0 };
  }
  const percent = Math.round((responseCount / totalSuppliers) * 100);
  return {
    fraction: `${responseCount}/${totalSuppliers}`,
    percent: Math.min(100, Math.max(0, percent)),
  };
}
