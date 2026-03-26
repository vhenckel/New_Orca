import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";

import type { ContactBlocklistItem } from "@/modules/contact/types/contact-blocklist";
import {
  useContactBlocklistList,
  useRemoveContactsFromBlocklist,
} from "@/modules/contact/hooks";
import { formatCpf } from "@/shared/lib/format";
import { formatWhatsApp } from "@/modules/contact/utils/format-whatsapp";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { DataTable } from "@/shared/components/data-table";
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { PermissionGuard } from "@/shared/auth/PermissionGuard";
import { useI18n } from "@/shared/i18n/useI18n";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useContactsBlocklistPaginationQueryState } from "@/shared/lib/nuqs-filters";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/sonner";
import type {
  AppliedFilter,
  FilterConfig,
} from "@/shared/components/dynamic-filters/types";

function formatBlocklistPhone(row: ContactBlocklistItem): string {
  if (row.appkey) return formatWhatsApp(row.appkey);
  if (row.phone) return row.phone;
  return "-";
}

function formatBlocklistDate(iso: string | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ContactBlocklistPage() {
  const { t } = useI18n();
  const { page, pageSize, setPagination, search, setSearch, setParams } =
    useContactsBlocklistPaginationQueryState();

  const debouncedSearch = useDebouncedValue(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      setParams({
        contactsBlPage: 1,
        contactsBlQ: debouncedSearch || null,
      });
    }
  }, [debouncedSearch, setParams]);

  const { data, error, isPending } = useContactBlocklistList({
    page,
    pageSize,
    search: debouncedSearch,
  });

  const removeMutation = useRemoveContactsFromBlocklist();
  const [selectedRows, setSelectedRows] = useState<ContactBlocklistItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filters = useMemo<FilterConfig[]>(() => [], []);
  const appliedFilters = useMemo<AppliedFilter[]>(() => [], []);

  const columns = useMemo<ColumnDef<ContactBlocklistItem>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: () => t("pages.contact.blocklist.col.name"),
        cell: ({ row }) => (
          <Link
            to={`/debt-negotiation/contacts/${row.original.id}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        id: "phone",
        header: () => t("pages.contact.blocklist.col.phone"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatBlocklistPhone(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "cpf",
        header: () => t("pages.contact.blocklist.col.cpf"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatCpf(row.original.cpf)}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: () => t("pages.contact.blocklist.col.date"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatBlocklistDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: "reason",
        header: () => t("pages.contact.blocklist.col.reason"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.reason || "-"}</span>
        ),
      },
      {
        accessorKey: "blockScope",
        header: () => t("pages.contact.blocklist.col.blockScope"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.blockScope ?? "-"}
          </span>
        ),
      },
    ],
    [t],
  );

  const totalRows = data?.total ?? 0;

  const handleConfirmRemove = async () => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0) return;
    try {
      await removeMutation.mutateAsync(ids);
      toast.success(t("pages.contact.blocklist.removeSuccess"));
      setSelectedRows([]);
      setConfirmOpen(false);
    } catch {
      toast.error(t("pages.contact.blocklist.removeError"));
    }
  };

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.contact.routes.blocklist.label")}
      subtitle={t("modules.contact.routes.blocklist.description")}
    >
      <FilterPanel
        showSearch
        searchValue={search}
        onSearchChange={(value) => void setSearch(value)}
        searchPlaceholder={t("pages.contact.blocklist.search")}
        filters={filters}
        appliedFilters={appliedFilters}
        onFiltersApply={async (_next) => {}}
        onFiltersClear={async () => {}}
        isLoading={isPending}
      />

      <PermissionGuard
        permissionNames={["retirar_da_blocklist"]}
        moduleName="contatos"
        subModuleName="blocklist"
      >
        {selectedRows.length > 0 ? (
          <div className="flex justify-start">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={removeMutation.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              {t("pages.contact.blocklist.removeAction")}
            </Button>
          </div>
        ) : null}
      </PermissionGuard>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>
            {t("pages.contact.blocklist.errors.loadList")}
          </AlertDescription>
        </Alert>
      )}

      <div className="card-surface overflow-hidden px-0 pb-4 pt-1 sm:px-1">
        <DataTable
          columns={columns}
          result={{ data: data?.data ?? [], total: totalRows }}
          page={page}
          pageSize={pageSize}
          onPaginationChange={setPagination}
          isLoading={isPending}
          getRowId={(row) => String(row.id)}
          onSelectionChange={setSelectedRows}
          emptyMessage={t("pages.contact.blocklist.emptyList")}
          hidePagination={totalRows === 0 && !isPending}
          tableContainerClassName="border-0 rounded-none shadow-none"
          paginationLabels={{
            previous: t("common.pagination.previous"),
            next: t("common.pagination.next"),
          }}
        />
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pages.contact.blocklist.dialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2 text-left">
                <p>{t("pages.contact.blocklist.dialog.description")}</p>
                <ul className="max-h-40 list-inside list-disc overflow-y-auto text-sm font-medium text-foreground">
                  {selectedRows.map((row) => (
                    <li key={row.id}>{row.name}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>
              {t("pages.contact.blocklist.dialog.cancel")}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => void handleConfirmRemove()}
            >
              {removeMutation.isPending
                ? t("pages.contact.blocklist.dialog.removing")
                : t("pages.contact.blocklist.dialog.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardPageLayout>
  );
}
