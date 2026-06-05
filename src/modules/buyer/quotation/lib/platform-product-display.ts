import type { PlatformProduct, PlatformProductDetail } from "@/modules/buyer/quotation/api/products-api";
import { formatPackagingUnit } from "@/modules/buyer/quotation/lib/create-budget-mapper";

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

/** Infere a marca a pré-preencher ao abrir o dialog de marcas. */
export function resolveInitialPlatformBrandId(
  product: PlatformProduct,
  searchQuery: string,
): string | undefined {
  const brands = product.brands ?? [];
  if (brands.length === 0) return undefined;
  if (brands.length === 1) return brands[0].id;

  const q = normalizeSearch(searchQuery);
  if (!q) return undefined;

  const matched = brands.filter((brand) => {
    const brandName = normalizeSearch(brand.name);
    return brandName.includes(q) || q.includes(brandName);
  });

  return matched.length === 1 ? matched[0].id : undefined;
}

/** Rótulo de produto da plataforma — nome, embalagem e marcas (como no legado). */
export function formatPlatformProductLabel(product: PlatformProduct): string {
  const packaging = formatPackagingUnit(product.packagingUnit ?? null);
  const base = packaging ? `${product.name} ${packaging}` : product.name;

  const brands = product.brands ?? [];
  if (brands.length === 0) return base;

  const display = brands.slice(0, 2).map((b) => b.name);
  const remaining = brands.length - display.length;
  const brandsStr =
    remaining > 0 ? `(${display.join(", ")} +${remaining})` : `(${display.join(", ")})`;

  return `${base} ${brandsStr}`;
}

export function formatProductNameWithPackaging(
  product: Pick<PlatformProductDetail, "name" | "packagingUnit">,
  separator = "-",
): string {
  const packaging = formatPackagingUnit(product.packagingUnit ?? null);
  if (!packaging) return product.name;
  return `${product.name} ${separator} ${packaging}`.trim();
}

export function formatProductNameTitle(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
