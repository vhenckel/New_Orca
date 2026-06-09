import { Copy, Plus } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { copySupplierCompaniesTsv } from "@/modules/admin/supplier-companies/api/supplier-companies-api";
import { SupplierCompanyDeleteConfirmDialog } from "@/modules/admin/supplier-companies/components/SupplierCompanyDeleteConfirmDialog";
import { SupplierCompanyListFilters } from "@/modules/admin/supplier-companies/components/SupplierCompanyListFilters";
import { SupplierCompanyListSkeleton } from "@/modules/admin/supplier-companies/components/SupplierCompanyListSkeleton";
import { SupplierCompanyListTable } from "@/modules/admin/supplier-companies/components/SupplierCompanyListTable";
import { useSupplierCompaniesInfiniteQuery } from "@/modules/admin/supplier-companies/hooks/useSupplierCompaniesInfiniteQuery";
import { useSupplierCompanyMutations } from "@/modules/admin/supplier-companies/hooks/useSupplierCompanyMutations";
import {
  clearSupplierCompanyListFilters,
  countActiveSupplierCompanyFilters,
  supplierCompanyListFilterParsers,
  supplierCompanyListFilterUrlKeys,
  toggleSupplierCompanySort,
  toSupplierCompaniesFetchParams,
} from "@/modules/admin/supplier-companies/lib/supplier-company-list-filters";
import type { SupplierCompanyListItem, SupplierCompanySortField } from "@/modules/admin/supplier-companies/types";
import { ApiError } from "@/shared/api/http-client";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/sonner";

export function SupplierCompaniesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const role = useApiUserRole();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierCompanyListItem | null>(null);
  const [copying, setCopying] = useState(false);

  const [query, setQuery] = useQueryStates(supplierCompanyListFilterParsers, {
    urlKeys: supplierCompanyListFilterUrlKeys,
  });

  const fetchParams = useMemo(() => toSupplierCompaniesFetchParams(query), [query]);
  const listState = useSupplierCompaniesInfiniteQuery(fetchParams, { enabled: role === "admin" });
  const { deleteMutation } = useSupplierCompanyMutations(fetchParams);

  const rows = useMemo(
    () => listState.data?.pages.flatMap((page) => page.data) ?? [],
    [listState.data],
  );
  const activeFilterCount = countActiveSupplierCompanyFilters(query);

  useEffect(() => {
    if (listState.isError) {
      toast.error(t("modules.admin.supplierCompanies.list.toast.loadError"));
    }
  }, [listState.isError, t]);

  if (role !== "admin") {
    return <Navigate to="/404" replace />;
  }

  const handleToggleSort = (field: SupplierCompanySortField) => {
    const next = toggleSupplierCompanySort(query.sort, query.order, field);
    void setQuery({ sort: next.sort, order: next.order });
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const tsv = await copySupplierCompaniesTsv(fetchParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.admin.supplierCompanies.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.admin.supplierCompanies.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t("modules.admin.supplierCompanies.list.toast.deleteSuccess"));
        setDeleteTarget(null);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : t("modules.admin.supplierCompanies.list.toast.deleteError");
        toast.error(message);
      },
    });
  };

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={copying}
        onClick={() => void handleCopy()}
      >
        <Copy className="size-4" />
        {t("modules.admin.supplierCompanies.list.copy")}
      </Button>
      <Button
        type="button"
        className="gap-2 text-white"
        onClick={() => navigate("/supplier-companies/create")}
      >
        <Plus className="size-4" />
        {t("modules.admin.supplierCompanies.list.add")}
      </Button>
    </div>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.admin.supplierCompanies.title")}
      subtitle={t("modules.admin.supplierCompanies.description")}
      headerActions={headerActions}
    >
      {listState.isLoading ? (
        <SupplierCompanyListSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <SupplierCompanyListFilters
            name={query.name}
            activeFilterCount={activeFilterCount}
            onNameChange={(value) => void setQuery({ name: value })}
            onClear={() => void setQuery(clearSupplierCompanyListFilters())}
          />
          <SupplierCompanyListTable
            rows={rows}
            sort={query.sort}
            onToggleSort={handleToggleSort}
            scrollRef={scrollRef}
            hasNextPage={listState.hasNextPage ?? false}
            isFetchingNextPage={listState.isFetchingNextPage}
            onLoadMore={() => void listState.fetchNextPage()}
            onDelete={setDeleteTarget}
          />
        </div>
      )}

      <SupplierCompanyDeleteConfirmDialog
        companyName={deleteTarget?.name ?? ""}
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
