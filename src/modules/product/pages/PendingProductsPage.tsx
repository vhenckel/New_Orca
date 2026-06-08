import { Copy, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { copySolicitationsTsv } from "@/modules/product/api/solicitations-api";
import { PendingProductListFilters } from "@/modules/product/components/PendingProductListFilters";
import { PendingProductListSkeleton } from "@/modules/product/components/PendingProductListSkeleton";
import { PendingProductListTable } from "@/modules/product/components/PendingProductListTable";
import { ProductModuleNav } from "@/modules/product/components/ProductModuleNav";
import { usePendingProductsInfiniteQuery } from "@/modules/product/hooks/usePendingProductsInfiniteQuery";
import { useProductListSupportQueries } from "@/modules/product/hooks/useProductListSupportQueries";
import {
  clearPendingProductListFilters,
  countActivePendingProductFilters,
  getPendingProductUrlSyncUpdates,
  pendingProductListFilterParsers,
  pendingProductListFilterUrlKeys,
  toPendingProductsFetchParams,
} from "@/modules/product/lib/pending-product-list-filters";
import type { SolicitationSortField, SortOrder } from "@/modules/product/types/pending-product";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";

function toggleSort(
  currentSort: string,
  currentOrder: string,
  field: SolicitationSortField,
): { sort: string; order: SortOrder } {
  if (currentSort !== field) return { sort: field, order: "ASC" };
  return { sort: field, order: currentOrder === "ASC" ? "DESC" : "ASC" };
}

export function PendingProductsPage() {
  const { t } = useI18n();
  const role = useApiUserRole();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);

  const [query, setQuery] = useQueryStates(pendingProductListFilterParsers, {
    urlKeys: pendingProductListFilterUrlKeys,
  });

  useLayoutEffect(() => {
    const updates = getPendingProductUrlSyncUpdates(window.location.search);
    if (!updates) return;
    void setQuery(updates, { history: "replace" });
  }, [setQuery]);

  const fetchParams = useMemo(() => toPendingProductsFetchParams(query), [query]);
  const listState = usePendingProductsInfiniteQuery(fetchParams, { enabled: role === "admin" });
  const { segments, establishments } = useProductListSupportQueries(role);

  const rows = useMemo(
    () => listState.data?.pages.flatMap((page) => page.data) ?? [],
    [listState.data],
  );
  const total = listState.data?.pages[0]?.total ?? 0;
  const activeFilterCount = countActivePendingProductFilters(query);

  useEffect(() => {
    if (listState.isError) {
      toast.error(t("modules.product.pending.list.toast.loadError"));
    }
  }, [listState.isError, t]);

  const handleToggleSort = (field: SolicitationSortField) => {
    const next = toggleSort(query.sort, query.order, field);
    void setQuery({ sort: next.sort, order: next.order });
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const tsv = await copySolicitationsTsv(fetchParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.product.pending.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.product.pending.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  if (role !== "admin") return <Navigate to="/404" replace />;

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.product.pending.list.pageTitle")}
      subtitle={t("modules.product.pending.list.pageSubtitle", { count: total })}
      headerActions={
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={copying}
          onClick={() => void handleCopy()}
        >
          <Copy className="size-4" />
          {t("modules.product.pending.list.copy")}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <ProductModuleNav />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("modules.product.pending.list.searchPlaceholder")}
              value={query.name}
              onChange={(e) => void setQuery({ name: e.target.value || null })}
            />
          </div>
          <PendingProductListFilters
            applied={{
              status: query.status,
              type: query.type,
              establishmentId: query.establishmentId,
              segmentId: query.segmentId,
            }}
            segments={segments}
            establishments={establishments}
            activeCount={activeFilterCount}
            onApply={(draft) => {
              void setQuery({
                status: draft.status || null,
                type: draft.type || null,
                establishmentId: draft.establishmentId || null,
                segmentId: draft.segmentId || null,
              });
            }}
            onClear={() => {
              const cleared = clearPendingProductListFilters();
              void setQuery({
                status: cleared.status || null,
                type: cleared.type || null,
                establishmentId: cleared.establishmentId || null,
                segmentId: cleared.segmentId || null,
              });
            }}
          />
        </div>

        {listState.isLoading ? (
          <PendingProductListSkeleton />
        ) : (
          <PendingProductListTable
            rows={rows}
            sort={query.sort}
            order={query.order}
            onToggleSort={handleToggleSort}
            scrollRef={scrollRef}
            hasNextPage={Boolean(listState.hasNextPage)}
            isFetchingNextPage={listState.isFetchingNextPage}
            onLoadMore={() => void listState.fetchNextPage()}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
