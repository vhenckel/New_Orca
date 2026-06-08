import { parseAsString } from "nuqs";

import type { ApprovalStatus } from "@/modules/product/lib/product-constants";
import {
  PENDING_PRODUCTS_LIST_DEFAULT_PARAMS,
  type FetchSolicitationsListParams,
  type SolicitationSortField,
  type SolicitationType,
  type SortOrder,
} from "@/modules/product/types/pending-product";

export const pendingProductListFilterParsers = {
  name: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  type: parseAsString.withDefault(""),
  establishmentId: parseAsString.withDefault(""),
  segmentId: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const pendingProductListFilterUrlKeys = {
  name: "pp_name",
  status: "pp_status",
  type: "pp_type",
  establishmentId: "pp_establishmentId",
  segmentId: "pp_segmentId",
  sort: "pp_sort",
  order: "pp_order",
} as const;

const PENDING_LEGACY_QUERY_KEYS: Record<keyof typeof pendingProductListFilterUrlKeys, string> = {
  name: "name",
  status: "status",
  type: "type",
  establishmentId: "establishmentId",
  segmentId: "segmentId",
  sort: "sort",
  order: "order",
};

/** Converte query params legados/documentados para o formato interno `pp_*`. */
export function buildPendingProductsSearchFromLegacy(search: string): string {
  const params = new URLSearchParams(search);
  const next = new URLSearchParams();

  for (const [internalKey, legacyKey] of Object.entries(PENDING_LEGACY_QUERY_KEYS)) {
    const nuqsKey = pendingProductListFilterUrlKeys[internalKey as keyof typeof pendingProductListFilterUrlKeys];
    const value = params.get(nuqsKey) ?? params.get(legacyKey);
    if (value) next.set(nuqsKey, value);
  }

  const qs = next.toString();
  return qs ? `?${qs}` : "";
}

/** Sincroniza params legados para nuqs e injeta `pending` quando status estiver ausente. */
export function getPendingProductUrlSyncUpdates(
  search: string,
): Partial<Record<keyof PendingProductListQueryState, string | null>> | null {
  const params = new URLSearchParams(search);
  const updates: Partial<Record<keyof PendingProductListQueryState, string | null>> = {};

  for (const [internalKey, legacyKey] of Object.entries(PENDING_LEGACY_QUERY_KEYS)) {
    const nuqsKey = pendingProductListFilterUrlKeys[internalKey as keyof typeof pendingProductListFilterUrlKeys];
    const nuqsValue = params.get(nuqsKey);
    const legacyValue = params.get(legacyKey);
    if (!nuqsValue && legacyValue) {
      updates[internalKey as keyof PendingProductListQueryState] = legacyValue;
    }
  }

  const hasStatus =
    params.get(pendingProductListFilterUrlKeys.status) ||
    updates.status ||
    params.get("status");

  if (!hasStatus) {
    updates.status = "pending";
  }

  if (Object.keys(updates).length === 0) return null;
  return updates;
}

export type PendingProductListQueryState = {
  name: string;
  status: string;
  type: string;
  establishmentId: string;
  segmentId: string;
  sort: string;
  order: string;
};

export function toPendingProductsFetchParams(
  query: PendingProductListQueryState,
): Omit<FetchSolicitationsListParams, "page"> {
  const params: Omit<FetchSolicitationsListParams, "page"> = {
    totalPerPage: PENDING_PRODUCTS_LIST_DEFAULT_PARAMS.totalPerPage,
    sort: PENDING_PRODUCTS_LIST_DEFAULT_PARAMS.sort,
    order: PENDING_PRODUCTS_LIST_DEFAULT_PARAMS.order,
    status: PENDING_PRODUCTS_LIST_DEFAULT_PARAMS.status,
  };

  if (query.name.trim()) params.name = query.name.trim();
  if (query.status) params.status = query.status as ApprovalStatus;
  if (query.type) params.type = query.type as SolicitationType;
  if (query.establishmentId) params.establishmentId = query.establishmentId;
  if (query.segmentId) params.segmentId = query.segmentId;
  if (query.sort) params.sort = query.sort as SolicitationSortField;
  if (query.order) params.order = query.order as SortOrder;

  return params;
}

export function countActivePendingProductFilters(
  query: Pick<PendingProductListQueryState, "status" | "type" | "establishmentId" | "segmentId">,
): number {
  let count = 0;
  if (query.status && query.status !== "pending") count += 1;
  if (query.type) count += 1;
  if (query.establishmentId) count += 1;
  if (query.segmentId) count += 1;
  return count;
}

export function clearPendingProductListFilters(): PendingProductListQueryState {
  return {
    name: "",
    status: "pending",
    type: "",
    establishmentId: "",
    segmentId: "",
    sort: "",
    order: "",
  };
}
