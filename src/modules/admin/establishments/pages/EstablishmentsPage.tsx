import { Copy, Plus, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { copyEstablishmentsTsv } from "@/modules/admin/establishments/api/establishments-api";
import { EstablishmentDeleteConfirmDialog } from "@/modules/admin/establishments/components/EstablishmentDeleteConfirmDialog";
import { EstablishmentListFilters } from "@/modules/admin/establishments/components/EstablishmentListFilters";
import { EstablishmentListSkeleton } from "@/modules/admin/establishments/components/EstablishmentListSkeleton";
import { EstablishmentListTable } from "@/modules/admin/establishments/components/EstablishmentListTable";
import { useEstablishmentMutations } from "@/modules/admin/establishments/hooks/useEstablishmentMutations";
import { useEstablishmentsInfiniteQuery } from "@/modules/admin/establishments/hooks/useEstablishmentsInfiniteQuery";
import {
  clearEstablishmentListFilters,
  countActiveEstablishmentFilters,
  establishmentListFilterParsers,
  establishmentListFilterUrlKeys,
  toEstablishmentsFetchParams,
} from "@/modules/admin/establishments/lib/establishment-list-filters";
import type { EstablishmentListItem, EstablishmentSortField, SortOrder } from "@/modules/admin/establishments/types";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";

function toggleSort(
  currentSort: string,
  currentOrder: string,
  field: EstablishmentSortField,
): { sort: string; order: SortOrder } {
  if (currentSort !== field) return { sort: field, order: "ASC" };
  return { sort: field, order: currentOrder === "ASC" ? "DESC" : "ASC" };
}

export function EstablishmentsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const role = useApiUserRole();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [copying, setCopying] = useState(false);

  const [query, setQuery] = useQueryStates(establishmentListFilterParsers, {
    urlKeys: establishmentListFilterUrlKeys,
  });

  const fetchParams = useMemo(() => toEstablishmentsFetchParams(query), [query]);
  const listState = useEstablishmentsInfiniteQuery(fetchParams, { enabled: role === "admin" });
  const { deleteMutation } = useEstablishmentMutations(fetchParams);

  const rows = useMemo(
    () => listState.data?.pages.flatMap((page) => page.data) ?? [],
    [listState.data],
  );
  const total = listState.data?.pages[0]?.total ?? 0;
  const activeFilterCount = countActiveEstablishmentFilters(query);

  useEffect(() => {
    if (listState.isError) {
      toast.error(t("modules.admin.establishments.list.toast.loadError"));
    }
  }, [listState.isError, t]);

  const handleToggleSort = (field: EstablishmentSortField) => {
    const next = toggleSort(query.sort, query.order, field);
    void setQuery({ sort: next.sort, order: next.order });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => toast.success(t("modules.admin.establishments.list.toast.deleteSuccess")),
      onError: () => toast.error(t("modules.admin.establishments.list.toast.deleteError")),
      onSettled: () => setDeleteTarget(null),
    });
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const tsv = await copyEstablishmentsTsv(fetchParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.admin.establishments.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.admin.establishments.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  if (role !== "admin") return <Navigate to="/404" replace />;

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.admin.establishments.title")}
      subtitle={t("modules.admin.establishments.list.pageSubtitle", { count: total })}
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
            {t("modules.admin.establishments.list.copy")}
          </Button>
          <Button
            type="button"
            className="gap-2 text-white"
            onClick={() => navigate("/estabelecimentos/criar-estabelecimento")}
          >
            <Plus className="size-4" />
            {t("modules.admin.establishments.list.add")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("modules.admin.establishments.list.searchPlaceholder")}
              value={query.name}
              onChange={(e) => void setQuery({ name: e.target.value || null })}
            />
          </div>
          <EstablishmentListFilters
            applied={{
              responsibleName: query.responsibleName,
              phone: query.phone,
              addressState: query.addressState,
              addressCity: query.addressCity,
              addressNeighborhood: query.addressNeighborhood,
              status: query.status,
              active: query.active,
            }}
            activeCount={activeFilterCount}
            onApply={(draft) => {
              void setQuery({
                responsibleName: draft.responsibleName || null,
                phone: draft.phone || null,
                addressState: draft.addressState || null,
                addressCity: draft.addressCity || null,
                addressNeighborhood: draft.addressNeighborhood || null,
                status: draft.status || null,
                active: draft.active || null,
              });
            }}
            onClear={() => {
              const cleared = clearEstablishmentListFilters();
              void setQuery({
                responsibleName: cleared.responsibleName || null,
                phone: cleared.phone || null,
                addressState: cleared.addressState || null,
                addressCity: cleared.addressCity || null,
                addressNeighborhood: cleared.addressNeighborhood || null,
                status: cleared.status || null,
                active: cleared.active || null,
              });
            }}
          />
        </div>

        {listState.isLoading ? (
          <EstablishmentListSkeleton />
        ) : (
          <EstablishmentListTable
            rows={rows}
            sort={query.sort}
            order={query.order}
            onToggleSort={handleToggleSort}
            scrollRef={scrollRef}
            hasNextPage={Boolean(listState.hasNextPage)}
            isFetchingNextPage={listState.isFetchingNextPage}
            onLoadMore={() => void listState.fetchNextPage()}
            onDelete={(row: EstablishmentListItem) =>
              setDeleteTarget({ id: row.id, name: row.name })
            }
          />
        )}
      </div>

      <EstablishmentDeleteConfirmDialog
        establishmentName={deleteTarget?.name ?? ""}
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
