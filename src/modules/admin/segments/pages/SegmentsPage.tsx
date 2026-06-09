import { Copy, Plus } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { copySegmentsTsv } from "@/modules/admin/segments/api/segments-api";
import { SegmentDeleteConfirmDialog } from "@/modules/admin/segments/components/SegmentDeleteConfirmDialog";
import { SegmentListFilters } from "@/modules/admin/segments/components/SegmentListFilters";
import { SegmentListSkeleton } from "@/modules/admin/segments/components/SegmentListSkeleton";
import { SegmentListTable } from "@/modules/admin/segments/components/SegmentListTable";
import { useSegmentMutations } from "@/modules/admin/segments/hooks/useSegmentMutations";
import { useSegmentsInfiniteQuery } from "@/modules/admin/segments/hooks/useSegmentsInfiniteQuery";
import {
  clearSegmentListFilters,
  countActiveSegmentFilters,
  segmentListFilterParsers,
  segmentListFilterUrlKeys,
  toSegmentsFetchParams,
} from "@/modules/admin/segments/lib/segment-list-filters";
import type { SegmentListItem, SegmentSortField, SortOrder } from "@/modules/admin/segments/types";
import { ApiError } from "@/shared/api/http-client";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/sonner";

function toggleSort(
  currentSort: string,
  currentOrder: string,
  field: SegmentSortField,
): { sort: string; order: SortOrder } {
  if (currentSort !== field) return { sort: field, order: "ASC" };
  return { sort: field, order: currentOrder === "ASC" ? "DESC" : "ASC" };
}

export function SegmentsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const role = useApiUserRole();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [copying, setCopying] = useState(false);

  const [query, setQuery] = useQueryStates(segmentListFilterParsers, {
    urlKeys: segmentListFilterUrlKeys,
  });

  const fetchParams = useMemo(() => toSegmentsFetchParams(query), [query]);
  const listState = useSegmentsInfiniteQuery(fetchParams, { enabled: role === "admin" });
  const { deleteMutation } = useSegmentMutations(fetchParams);

  const rows = useMemo(
    () => listState.data?.pages.flatMap((page) => page.data) ?? [],
    [listState.data],
  );
  const total = listState.data?.pages[0]?.total ?? 0;
  const activeFilterCount = countActiveSegmentFilters(query);

  useEffect(() => {
    if (listState.isError) {
      toast.error(t("modules.admin.segments.list.toast.loadError"));
    }
  }, [listState.isError, t]);

  const handleToggleSort = (field: SegmentSortField) => {
    const next = toggleSort(query.sort, query.order, field);
    void setQuery({ sort: next.sort, order: next.order });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => toast.success(t("modules.admin.segments.list.toast.deleteSuccess")),
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : t("modules.admin.segments.list.toast.deleteError");
        toast.error(message);
      },
      onSettled: () => setDeleteTarget(null),
    });
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const tsv = await copySegmentsTsv(fetchParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.admin.segments.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.admin.segments.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  if (role !== "admin") return <Navigate to="/404" replace />;

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.admin.segments.title")}
      subtitle={t("modules.admin.segments.list.pageSubtitle", { count: total })}
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={copying}
            onClick={() => void handleCopy()}
          >
            <Copy className="size-4" />
            {t("modules.admin.segments.list.copy")}
          </Button>
          <Button
            type="button"
            className="gap-2 text-white"
            onClick={() => navigate("/segmentos/criar-segmento")}
          >
            <Plus className="size-4" />
            {t("modules.admin.segments.list.add")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <SegmentListFilters
            applied={{ active: query.active }}
            activeCount={activeFilterCount}
            onApply={(draft) => {
              void setQuery({ active: draft.active || null });
            }}
            onClear={() => {
              const cleared = clearSegmentListFilters();
              void setQuery({ active: cleared.active || null });
            }}
          />
        </div>

        {listState.isLoading ? (
          <SegmentListSkeleton />
        ) : (
          <SegmentListTable
            rows={rows}
            sort={query.sort || "name"}
            onToggleSort={handleToggleSort}
            scrollRef={scrollRef}
            hasNextPage={Boolean(listState.hasNextPage)}
            isFetchingNextPage={listState.isFetchingNextPage}
            onLoadMore={() => void listState.fetchNextPage()}
            onDelete={(row: SegmentListItem) => setDeleteTarget({ id: row.id, name: row.name })}
          />
        )}
      </div>

      <SegmentDeleteConfirmDialog
        segmentName={deleteTarget?.name ?? ""}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </DashboardPageLayout>
  );
}
