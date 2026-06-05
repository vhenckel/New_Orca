import {
  createEstablishmentProductBrand,
  patchEstablishmentProductWithBrands,
} from "@/modules/buyer/quotation/api/establishment-products-api";
import {
  creatableBrandName,
  isCreatableBrandValue,
  lineBaseProductId,
} from "@/modules/buyer/quotation/lib/create-budget-rules";
import type { BudgetLineItem } from "@/modules/buyer/quotation/types";
import type { EstablishmentProduct } from "@/modules/buyer/quotation/types/create-budget";

function sortedBrandIds(ids: string[]): string[] {
  return [...ids].sort();
}

function brandSetsMatch(a: string[], b: string[]): boolean {
  const sa = sortedBrandIds(a);
  const sb = sortedBrandIds(b);
  if (sa.length !== sb.length) return false;
  return sa.every((id, i) => id === sb[i]);
}

function findCatalogMatch(
  catalog: EstablishmentProduct[],
  baseProductId: string,
  brandIds: string[],
  quoteAnyBrand: boolean,
): EstablishmentProduct | undefined {
  return catalog.find(
    (p) =>
      p.id === baseProductId &&
      p.quoteAnyBrand === quoteAnyBrand &&
      (quoteAnyBrand || brandSetsMatch(p.brands.map((b) => b.id), brandIds)),
  );
}

async function resolveCreatableBrandIds(
  establishmentProductId: string,
  brandIds: string[],
): Promise<string[]> {
  const resolved: string[] = [];
  for (const id of brandIds) {
    if (!isCreatableBrandValue(id)) {
      resolved.push(id);
      continue;
    }
    const created = await createEstablishmentProductBrand(
      establishmentProductId,
      creatableBrandName(id),
    );
    resolved.push(created.id);
  }
  return resolved;
}

/**
 * Garante brandIds reais e establishmentProductId coerente antes do POST/PUT.
 */
export async function resolveLinesForSubmit(
  lines: BudgetLineItem[],
  catalog: EstablishmentProduct[],
): Promise<BudgetLineItem[]> {
  const resolved: BudgetLineItem[] = [];

  for (const line of lines) {
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) continue;

    const baseId = lineBaseProductId(line);
    let brandIds = [...(line.brandIds ?? [])];
    let establishmentProductId = line.establishmentProductId;

    if (establishmentProductId && brandIds.some(isCreatableBrandValue)) {
      brandIds = await resolveCreatableBrandIds(establishmentProductId, brandIds);
    }

    let match = findCatalogMatch(catalog, baseId, brandIds, line.anyBrand);

    if (!match && establishmentProductId && !line.anyBrand && brandIds.length > 0) {
      match = await patchEstablishmentProductWithBrands(establishmentProductId, brandIds);
      catalog.push(match);
    }

    if (match) {
      establishmentProductId = match.establishmentProductId;
      if (!line.anyBrand) {
        brandIds = match.brands.map((b) => b.id);
      }
    }

    resolved.push({
      ...line,
      baseProductId: baseId,
      establishmentProductId,
      brandIds,
    });
  }

  return resolved;
}
