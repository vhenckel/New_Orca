import type { BudgetLineItem } from "@/modules/buyer/quotation/types";
import { MAX_QTY } from "@/modules/buyer/quotation/lib/create-budget-schema";
import { stripCompositeProductId } from "@/modules/buyer/quotation/lib/create-budget-mapper";

export const CREATABLE_BRAND_PREFIX = "creatable:";

export function isIntegerUnit(unit: string): boolean {
  return unit.trim().toLowerCase() === "un";
}

/** Normaliza quantidade conforme unidade (inteira vs decimal) e teto 100.000. */
export function normalizeQuantity(raw: number, unit: string): number | undefined {
  if (!Number.isFinite(raw) || Number.isNaN(raw)) return undefined;
  const capped = Math.min(Math.max(0, raw), MAX_QTY);
  if (capped === 0) return 0;
  if (isIntegerUnit(unit)) {
    const truncated = Math.trunc(capped);
    return truncated >= 1 ? truncated : undefined;
  }
  if (capped < 0.0001) return undefined;
  return Number(capped.toFixed(4));
}

export function lineBaseProductId(line: BudgetLineItem): string {
  return line.baseProductId ?? stripCompositeProductId(line.productId);
}

/** Chave de duplicata produto+marca (doc: baseId::brandIds ordenados). */
export function lineDuplicateKey(line: BudgetLineItem): string {
  const base = lineBaseProductId(line);
  if (line.anyBrand) return `${base}::any`;
  const ids = [...(line.brandIds ?? [])].sort();
  return `${base}::${ids.join(",")}`;
}

export function findDuplicateLineKeys(lines: BudgetLineItem[]): Map<string, string[]> {
  const byKey = new Map<string, string[]>();
  for (const line of lines) {
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) continue;
    const key = lineDuplicateKey(line);
    const base = lineBaseProductId(line);
    const names = byKey.get(key) ?? [];
    names.push(base);
    byKey.set(key, names);
  }
  const duplicates = new Map<string, string[]>();
  for (const [key, names] of byKey) {
    if (names.length > 1) duplicates.set(key, names);
  }
  return duplicates;
}

export function duplicateProductDisplayNames(
  lines: BudgetLineItem[],
  productNameById: Map<string, string>,
): string[] {
  const dupKeys = findDuplicateLineKeys(lines);
  if (dupKeys.size === 0) return [];
  const names = new Set<string>();
  for (const line of lines) {
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) continue;
    if (!dupKeys.has(lineDuplicateKey(line))) continue;
    const name = productNameById.get(line.productId) ?? lineBaseProductId(line);
    names.add(name);
  }
  return [...names];
}

export function hasZeroQuantityLines(lines: BudgetLineItem[]): boolean {
  return lines.some((line) => !Number.isFinite(line.quantity) || line.quantity === 0);
}

export function isCreatableBrandValue(value: string): boolean {
  return value.startsWith(CREATABLE_BRAND_PREFIX);
}

export function creatableBrandName(value: string): string {
  return value.slice(CREATABLE_BRAND_PREFIX.length);
}
