import type {
  AdminProductListItem,
  EstablishmentProductListItem,
  ProductPackagingUnit,
} from "@/modules/product/types/product-list";
import { formatPackagingUnit } from "@/modules/buyer/quotation/lib/create-budget-mapper";

export function formatProductNameWithPackaging(
  name: string,
  packagingUnit?: ProductPackagingUnit | null,
  separator = "-",
): string {
  const packaging = formatPackagingUnit(packagingUnit ?? null);
  if (!packaging) return name;
  return `${name} ${separator} ${packaging}`.trim();
}

export function formatAdminProductName(product: AdminProductListItem): string {
  return formatProductNameWithPackaging(product.name, product.packagingUnit);
}

export function formatEstablishmentProductName(product: EstablishmentProductListItem): string {
  return formatProductNameWithPackaging(product.name, product.packagingUnit);
}

export function getAdminSegmentLabels(product: AdminProductListItem): string[] {
  return product.segments ?? [];
}

export function getEstablishmentSegmentLabels(product: EstablishmentProductListItem): string[] {
  return (product.segments ?? []).map((s) => s.name);
}

export function getBrandNames(
  product: AdminProductListItem | EstablishmentProductListItem,
): string[] {
  return (product.brands ?? []).map((b) => b.name);
}
