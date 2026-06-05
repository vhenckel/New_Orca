import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

import type { CatalogProduct } from "@/modules/product";
import type { BudgetLineItem } from "@/modules/buyer/quotation/types";
import type {
  BudgetDetail,
  BudgetProductPayloadItem,
  CreateBudgetPayload,
  EstablishmentProduct,
  EstablishmentProductPackaging,
  UpdateBudgetPayload,
} from "@/modules/buyer/quotation/types/create-budget";

export type BudgetLineBrandsLabels = {
  anyBrand: string;
  none: string;
};

const PACKAGING_UNIT_SUFFIX: Record<string, string> = {
  ml: "ml",
  l: "L",
  g: "g",
  kg: "kg",
  un: "un",
};

export function formatPackagingUnit(packaging?: EstablishmentProductPackaging | null): string {
  if (!packaging) return "";
  const suffix = PACKAGING_UNIT_SUFFIX[packaging.unit.toLowerCase()] ?? packaging.unit;
  return `${packaging.weight} ${suffix}`;
}

export function compositeProductKey(product: EstablishmentProduct): string {
  return `${product.id}_${product.establishmentProductId}`;
}

export function stripCompositeProductId(compositeId: string): string {
  const idx = compositeId.indexOf("_");
  if (idx === -1) return compositeId;
  return compositeId.slice(0, idx);
}

export function formatProductListTitle(name: string): string {
  return name;
}

/** Rótulo compacto de marcas — ex.: "Josue, Alto Alegre, União +1". */
export function formatBrandsLabel(brands: string[], maxVisible = 3): string {
  if (brands.length === 0) return "";
  if (brands.length <= maxVisible) return brands.join(", ");
  const head = brands.slice(0, maxVisible).join(", ");
  return `${head} +${brands.length - maxVisible}`;
}

export function formatBudgetLineBrandsSummary(
  line: BudgetLineItem,
  _product: CatalogProduct,
  labels: BudgetLineBrandsLabels,
): string {
  if (line.anyBrand) return labels.anyBrand;
  if (line.brands.length === 0) return labels.none;
  return formatBrandsLabel(line.brands, 3);
}

export function formatBudgetLineCollapsedSummary(
  line: BudgetLineItem,
  product: CatalogProduct,
  brandLabels: BudgetLineBrandsLabels,
): string {
  const parts: string[] = [];
  const packaging = formatPackagingUnit(product.packagingUnit);
  if (packaging) parts.push(packaging);
  if (Number.isFinite(line.quantity) && line.quantity > 0) {
    parts.push(`${line.quantity} ${product.unit}`);
  }
  const brands = formatBudgetLineBrandsSummary(line, product, brandLabels);
  if (brands && brands !== brandLabels.none) parts.push(brands);
  return parts.join(" · ");
}

export function formatProductListSubtitle(
  product: Pick<CatalogProduct, "brands" | "packagingUnit">,
  options?: { quoteAnyBrand?: boolean },
): string {
  const parts: string[] = [];
  if (!options?.quoteAnyBrand && product.brands.length > 0) {
    parts.push(product.brands.join(" · "));
  }
  const packaging = formatPackagingUnit(product.packagingUnit);
  if (packaging) parts.push(packaging);
  return parts.join(" · ") || "—";
}

export function toCatalogProduct(product: EstablishmentProduct): CatalogProduct {
  const segmentLabel = product.segments.map((s) => s.name).join(", ");
  return {
    id: compositeProductKey(product),
    name: product.name,
    categoryLabel: segmentLabel,
    category: product.segments[0]?.id ?? "",
    unit: product.unitType,
    unitPriceCents: 0,
    brands: product.brands.map((b) => b.name),
    packagingUnit: product.packagingUnit ?? null,
  };
}

export function buildCatalogIndex(products: EstablishmentProduct[]) {
  const catalog: CatalogProduct[] = [];
  const byCompositeId = new Map<string, EstablishmentProduct>();
  const brandIdByCompositeAndName = new Map<string, Map<string, string>>();

  for (const product of products) {
    const key = compositeProductKey(product);
    catalog.push(toCatalogProduct(product));
    byCompositeId.set(key, product);
    const brandMap = new Map(product.brands.map((b) => [b.name, b.id]));
    brandIdByCompositeAndName.set(key, brandMap);
  }

  return { catalog, byCompositeId, brandIdByCompositeAndName };
}

export function brandIdsFromNames(
  compositeProductId: string,
  brandNames: string[],
  brandIdByCompositeAndName: Map<string, Map<string, string>>,
): string[] {
  const map = brandIdByCompositeAndName.get(compositeProductId);
  if (!map) return [];
  return brandNames.map((name) => map.get(name)).filter((id): id is string => Boolean(id));
}

export function brandNamesFromIds(product: EstablishmentProduct, brandIds: string[]): string[] {
  const idSet = new Set(brandIds);
  return product.brands.filter((b) => idSet.has(b.id)).map((b) => b.name);
}

export function emptyLineFromCatalog(
  product: CatalogProduct,
  source?: EstablishmentProduct,
): BudgetLineItem {
  const quoteAnyBrand = source?.quoteAnyBrand ?? false;
  const brandNames = source?.brands.map((b) => b.name) ?? product.brands;
  const brandIds = source?.brands.map((b) => b.id) ?? [];
  const shouldPreselectBrands = !quoteAnyBrand && brandNames.length > 0;

  return {
    productId: product.id,
    baseProductId: source?.id ?? stripCompositeProductId(product.id),
    establishmentProductId: source?.establishmentProductId,
    quantity: 1,
    anyBrand: quoteAnyBrand,
    brands: shouldPreselectBrands ? brandNames : [],
    brandIds: shouldPreselectBrands ? brandIds : [],
    note: "",
  };
}

export function combineDeadlineIso(deadlineDate: Date, deadlineTime: string): string {
  const [hours, minutes] = deadlineTime.split(":").map((v) => Number(v));
  const combined = new Date(deadlineDate);
  combined.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return combined.toISOString();
}

export function parseDeadlineFromIso(iso: string): { date: Date; time: string } {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date: d, time };
}

function buildDeadlineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map((v) => Number(v));
  const combined = new Date(date);
  combined.setHours(
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );
  return combined;
}

/**
 * Ao reabrir orçamento salvo com prazo vencido, recalcula como hoje + X dias,
 * onde X é a diferença em dias entre a criação e o prazo original.
 */
export function resolveEditableDeadline(
  deadlineIso: string,
  createdAtIso?: string | null,
): { date: Date; time: string } {
  const parsed = parseDeadlineFromIso(deadlineIso);
  const currentDeadline = buildDeadlineDateTime(parsed.date, parsed.time);

  if (currentDeadline.getTime() > Date.now()) {
    return parsed;
  }

  let candidateDate: Date;

  if (createdAtIso) {
    const offsetDays = differenceInCalendarDays(
      startOfDay(new Date(deadlineIso)),
      startOfDay(new Date(createdAtIso)),
    );
    candidateDate = addDays(startOfDay(new Date()), Math.max(0, offsetDays));
  } else {
    candidateDate = startOfDay(new Date());
  }

  let shifted = buildDeadlineDateTime(candidateDate, parsed.time);
  let guard = 0;
  while (shifted.getTime() <= Date.now() && guard < 366) {
    candidateDate = addDays(candidateDate, 1);
    shifted = buildDeadlineDateTime(candidateDate, parsed.time);
    guard += 1;
  }

  return { date: candidateDate, time: parsed.time };
}

function lineToPayloadItem(line: BudgetLineItem): BudgetProductPayloadItem | null {
  if (!Number.isFinite(line.quantity) || line.quantity <= 0) return null;
  return {
    id: line.budgetProductId,
    productId: line.baseProductId ?? stripCompositeProductId(line.productId),
    quantity: line.quantity,
    brandIds: line.brandIds ?? [],
    quoteAnyBrand: line.anyBrand,
    observation: line.note?.trim() ? line.note.trim() : null,
  };
}

export function buildCreateBudgetPayload(
  establishmentId: string,
  deadlineDate: Date,
  deadlineTime: string,
  deliveryTime: string,
  observation: string,
  lines: BudgetLineItem[],
): CreateBudgetPayload {
  return {
    establishmentId,
    deadline: combineDeadlineIso(deadlineDate, deadlineTime),
    deliveryTime: deliveryTime.trim() || undefined,
    observation: observation.trim() || null,
    items: lines.map(lineToPayloadItem).filter((item): item is BudgetProductPayloadItem => item !== null),
  };
}

export function buildUpdateBudgetPayload(
  deadlineDate: Date,
  deadlineTime: string,
  deliveryTime: string,
  observation: string,
  lines: BudgetLineItem[],
): UpdateBudgetPayload {
  return {
    deadline: combineDeadlineIso(deadlineDate, deadlineTime),
    deliveryTime: deliveryTime.trim() || undefined,
    observation: observation.trim() || null,
    items: lines.map(lineToPayloadItem).filter((item): item is BudgetProductPayloadItem => item !== null),
  };
}

/** Recompõe productId composto e linhas a partir do detalhe do orçamento. */
export function linesFromBudgetDetail(
  detail: BudgetDetail,
  catalogByBaseId: Map<string, EstablishmentProduct>,
): { lines: Record<string, BudgetLineItem>; order: string[] } {
  const lines: Record<string, BudgetLineItem> = {};
  const order: string[] = [];

  for (const item of detail.items) {
    const catalogMatch =
      [...catalogByBaseId.values()].find(
        (p) =>
          p.id === item.productId &&
          arraysEqual(
            p.brands.map((b) => b.id).sort(),
            item.brands.map((b) => b.id).sort(),
          ),
      ) ?? catalogByBaseId.get(item.productId);

    const composite = catalogMatch
      ? compositeProductKey(catalogMatch)
      : `${item.productId}_${item.id}`;

    lines[composite] = {
      productId: composite,
      baseProductId: item.productId,
      establishmentProductId: catalogMatch?.establishmentProductId,
      budgetProductId: item.id,
      quantity: item.quantity,
      anyBrand: item.quoteAnyBrand,
      brands: item.brands.map((b) => b.name),
      brandIds: item.brands.map((b) => b.id),
      note: item.observation ?? "",
    };
    order.push(composite);
  }

  return { lines, order };
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export function catalogByBaseProductId(products: EstablishmentProduct[]): Map<string, EstablishmentProduct> {
  const map = new Map<string, EstablishmentProduct>();
  for (const p of products) {
    if (!map.has(p.id)) map.set(p.id, p);
  }
  return map;
}
