import { Copy, Plus, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { copySuppliersTsv } from "@/modules/suppliers/api/suppliers-api";
import { SupplierDeleteConfirmDialog } from "@/modules/suppliers/components/SupplierDeleteConfirmDialog";
import { SupplierListFilters } from "@/modules/suppliers/components/SupplierListFilters";
import { SupplierListSkeleton } from "@/modules/suppliers/components/SupplierListSkeleton";
import { SupplierListTable } from "@/modules/suppliers/components/SupplierListTable";
import { useSupplierListSupportQueries } from "@/modules/suppliers/hooks/useSupplierListSupportQueries";
import { useSupplierMutations } from "@/modules/suppliers/hooks/useSupplierMutations";
import { useSuppliersInfiniteQuery } from "@/modules/suppliers/hooks/useSuppliersInfiniteQuery";
import {
  clearSupplierListFilters,
  countActiveSupplierFilters,
  supplierListFilterParsers,
  supplierListFilterUrlKeys,
  toSuppliersFetchParams,
} from "@/modules/suppliers/lib/supplier-list-filters";
import { restoreSupplierListScroll } from "@/modules/suppliers/lib/supplier-list-navigation";
import type { SortOrder, SupplierListItem, SupplierSortField } from "@/modules/suppliers/types/supplier-list";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";

function toggleSort(
  currentSort: string,
  currentOrder: string,
  field: SupplierSortField,
): { sort: string; order: SortOrder } {
  if (currentSort !== field) return { sort: field, order: "ASC" };
  return { sort: field, order: currentOrder === "ASC" ? "DESC" : "ASC" };
}

export function SuppliersPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const role = useApiUserRole();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [copying, setCopying] = useState(false);

  const isAdmin = role === "admin";
  const isEstablishment = role === "establishment";

  const [query, setQuery] = useQueryStates(supplierListFilterParsers, {
    urlKeys: supplierListFilterUrlKeys,
  });

  const fetchParams = useMemo(() => toSuppliersFetchParams(query), [query]);
  const listState = useSuppliersInfiniteQuery(fetchParams, {
    enabled: isAdmin || isEstablishment,
  });
  const { deleteMutation } = useSupplierMutations(fetchParams);

  const { segments, establishments } = useSupplierListSupportQueries(role);

  const showEstablishmentFilter = isAdmin || (isEstablishment && establishments.length > 1);

  const rows = useMemo(
    () => listState.data?.pages.flatMap((page) => page.data) ?? [],
    [listState.data],
  );
  const total = listState.data?.pages[0]?.total ?? 0;

  const activeFilterCount = countActiveSupplierFilters(query, {
    includeEstablishment: showEstablishmentFilter,
  });

  useEffect(() => {
    if (listState.isError) {
      toast.error(t("modules.suppliers.list.toast.loadError"));
    }
  }, [listState.isError, t]);

  useLayoutEffect(() => {
    restoreSupplierListScroll(scrollRef.current);
  }, []);

  useEffect(() => {
    if (!isEstablishment || query.establishmentId !== "") return;
    if (establishments.length === 1 && establishments[0]?.id) {
      void setQuery({ establishmentId: establishments[0].id });
    }
  }, [isEstablishment, query.establishmentId, establishments, setQuery]);

  const handleToggleSort = (field: SupplierSortField) => {
    const next = toggleSort(query.sort, query.order, field);
    void setQuery({ sort: next.sort, order: next.order });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => toast.success(t("modules.suppliers.list.toast.deleteSuccess")),
      onError: () => toast.error(t("modules.suppliers.list.toast.deleteError")),
      onSettled: () => setDeleteTarget(null),
    });
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const tsv = await copySuppliersTsv(fetchParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.suppliers.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.suppliers.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  if (!isAdmin && !isEstablishment) return null;

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      {isAdmin ? (
        <>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={copying}
            onClick={() => void handleCopy()}
          >
            <Copy className="size-4" />
            {t("modules.suppliers.list.copy")}
          </Button>
          <Button type="button" className="gap-2 text-white" onClick={() => navigate("/suppliers/create")}>
            <Plus className="size-4" />
            {t("modules.suppliers.list.add")}
          </Button>
        </>
      ) : null}
    </div>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.suppliers.list.pageTitle")}
      subtitle={t("modules.suppliers.list.pageSubtitle", { count: total })}
      headerActions={headerActions}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("modules.suppliers.list.searchPlaceholder")}
              value={query.name}
              onChange={(e) => void setQuery({ name: e.target.value || null })}
            />
          </div>
          <SupplierListFilters
            role={role}
            applied={{
              responsibleName: query.responsibleName,
              phone: query.phone,
              email: query.email,
              segmentId: query.segmentId,
              establishmentId: query.establishmentId,
              state: query.state,
              city: query.city,
              neighborhood: query.neighborhood,
            }}
            segments={segments}
            establishments={establishments}
            showEstablishmentFilter={showEstablishmentFilter}
            activeCount={activeFilterCount}
            onApply={(draft) => {
              void setQuery({
                responsibleName: draft.responsibleName || null,
                phone: draft.phone || null,
                email: draft.email || null,
                segmentId: draft.segmentId || null,
                establishmentId:
                  showEstablishmentFilter && draft.establishmentId ? draft.establishmentId : null,
                state: draft.state || null,
                city: draft.city || null,
                neighborhood: draft.neighborhood || null,
              });
            }}
            onClear={() => {
              const cleared = clearSupplierListFilters();
              void setQuery({
                responsibleName: cleared.responsibleName || null,
                phone: cleared.phone || null,
                email: cleared.email || null,
                segmentId: cleared.segmentId || null,
                establishmentId: cleared.establishmentId || null,
                state: cleared.state || null,
                city: cleared.city || null,
                neighborhood: cleared.neighborhood || null,
              });
            }}
          />
        </div>

        {listState.isLoading ? (
          <SupplierListSkeleton />
        ) : (
          <SupplierListTable
            role={role!}
            rows={rows}
            sort={query.sort}
            order={query.order}
            onToggleSort={handleToggleSort}
            scrollRef={scrollRef}
            hasNextPage={Boolean(listState.hasNextPage)}
            isFetchingNextPage={listState.isFetchingNextPage}
            onLoadMore={() => void listState.fetchNextPage()}
            onDelete={
              isAdmin
                ? (row: SupplierListItem) => setDeleteTarget({ id: row.id, name: row.name })
                : undefined
            }
          />
        )}
      </div>

      {deleteTarget ? (
        <SupplierDeleteConfirmDialog
          supplierName={deleteTarget.name}
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDeleteConfirm}
          isPending={deleteMutation.isPending}
        />
      ) : null}
    </DashboardPageLayout>
  );
}
