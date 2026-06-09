import { pendingProductListFilterUrlKeys } from "@/modules/product/lib/pending-product-list-filters";
import { productListFilterUrlKeys } from "@/modules/product/lib/product-list-filters";
import { supplierListFilterUrlKeys } from "@/modules/suppliers/lib/supplier-list-filters";

export function buildSuppliersBySegmentUrl(segmentId: string): string {
  const params = new URLSearchParams();
  params.set(supplierListFilterUrlKeys.segmentId, segmentId);
  return `/suppliers?${params.toString()}`;
}

export function buildApprovedProductsBySegmentUrl(segmentId: string): string {
  const params = new URLSearchParams();
  params.set(productListFilterUrlKeys.segmentId, segmentId);
  return `/products?${params.toString()}`;
}

export function buildPendingProductsBySegmentUrl(segmentId: string): string {
  const params = new URLSearchParams();
  params.set(pendingProductListFilterUrlKeys.segmentId, segmentId);
  params.set(pendingProductListFilterUrlKeys.status, "pending");
  params.set(pendingProductListFilterUrlKeys.type, "product_creation");
  return `/products/pending?${params.toString()}`;
}

export function buildRejectedProductsBySegmentUrl(segmentId: string): string {
  const params = new URLSearchParams();
  params.set(pendingProductListFilterUrlKeys.segmentId, segmentId);
  params.set(pendingProductListFilterUrlKeys.status, "rejected");
  params.set(pendingProductListFilterUrlKeys.type, "product_creation");
  return `/products/pending?${params.toString()}`;
}

export function segmentHasLinkedEntities(row: {
  supplierCount: number;
  productsActive: number;
  productsPending: number;
  productsRejected: number;
}): boolean {
  return (
    row.supplierCount > 0 ||
    row.productsActive + row.productsPending + row.productsRejected > 0
  );
}
