import type { EstablishmentProductListItem } from "@/modules/product/types/product-list";

export function dedupeEstablishmentProducts(
  rows: EstablishmentProductListItem[],
): EstablishmentProductListItem[] {
  const seen = new Set<string>();
  const result: EstablishmentProductListItem[] = [];

  for (const row of rows) {
    const key = row.establishmentProductId || row.id;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }

  return result;
}
