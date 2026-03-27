import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, UserMinus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import type { ContactBlocklistItem } from "@/modules/contact/types/contact-blocklist";
import {
  useContactBlocklistList,
  useRemoveContactsFromBlocklist,
} from "@/modules/contact/hooks";
import { formatWhatsApp } from "@/modules/contact/utils/format-whatsapp";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { DataTable } from "@/shared/components/data-table";
import { NameDocumentCell } from "@/shared/components/data-table/NameDocumentCell";
import { SortHeader } from "@/shared/components/data-table/SortHeader";
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { PermissionGuard } from "@/shared/auth/PermissionGuard";
import { useI18n } from "@/shared/i18n/useI18n";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { formatContactListDate } from "@/shared/lib/format-contact-list-date";
import {
  useContactsBlocklistPaginationQueryState,
} from "@/shared/lib/nuqs-filters";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type {
  AppliedFilter,
  FilterConfig,
} from "@/shared/components/dynamic-filters/types";

function formatBlocklistPhone(row: ContactBlocklistItem): string {
  if (row.appkey) return formatWhatsApp(row.appkey);
  if (row.phone) return row.phone;
  return "-";
}

export function ContactBlocklistPage() {
  const { t, locale } = useI18n();
  const { page, pageSize, setPagination, search, setSearch, orderBy, orderDirection, setParams } =
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

  const toggleSort = (next: string) => {
    const nextDir =
      orderBy !== next ? "ASC" : orderDirection === "ASC" ? "DESC" : "ASC";
    setParams({
      contactsBlPage: 1,
      contactsBlOrderBy: next,
      contactsBlOrderDir: nextDir,
    });
  };

  const { data, error, isPending } = useContactBlocklistList({
    page,
    pageSize,
    search: debouncedSearch,
    orderBy,
    orderDirection,
  });

  const removeMutation = useRemoveContactsFromBlocklist();
  const [pendingRemove, setPendingRemove] = useState<ContactBlocklistItem | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filters = useMemo<FilterConfig[]>(() => [], []);
  const appliedFilters = useMemo<AppliedFilter[]>(() => [], []);

  const columns = useMemo<ColumnDef<ContactBlocklistItem>[]>(
    () => [
      {
        id: "actions",
        header: () => (
          <span className="block w-full">{t("pages.contact.blocklist.col.actions")}</span>
        ),
        cell: ({ row }) => (
          <div className="flex w-full justify-center">
            <PermissionGuard
              permissionNames={["retirar_da_blocklist"]}
              moduleName="contatos"
              subModuleName="blocklist"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    aria-label={t("pages.contact.blocklist.removeAction")}
                    disabled={removeMutation.isPending}
                    onClick={() => {
                      setPendingRemove(row.original);
                      setConfirmOpen(true);
                    }}
                  >
                    <UserMinus className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("pages.contact.blocklist.removeAction")}</TooltipContent>
              </Tooltip>
            </PermissionGuard>
          </div>
        ),
        size: 72,
        minSize: 64,
        maxSize: 80,
      },
      {
        id: "name",
        accessorKey: "name",
        header: () => t("pages.contact.blocklist.col.name"),
        cell: ({ row }) => (
          <NameDocumentCell
            name={row.original.name}
            href={`/contacts/${row.original.id}`}
            cpf={row.original.cpf}
            cnpj={row.original.cnpj}
          />
        ),
      },
      {
        id: "phone",
        header: () => t("pages.debtNegotiation.contacts.col.whatsapp"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatBlocklistPhone(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "reason",
        meta: {
          headerClassName: "min-w-80 lg:min-w-96",
          cellClassName: "min-w-80 lg:min-w-96",
        },
        header: () => t("pages.contact.blocklist.col.reason"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.reason || "-"}
          </span>
        ),
      },
      {
        accessorKey: "date",
        size: 160,
        minSize: 140,
        header: () => (
          <SortHeader
            variant="compact"
            label={t("pages.contact.blocklist.col.date")}
            active={orderBy === "date"}
            direction={orderDirection}
            onClick={() => toggleSort("date")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatContactListDate(row.original.date, locale)}
          </span>
        ),
      },
    ],
    [locale, orderBy, orderDirection, removeMutation.isPending, t],
  );

  const totalRows = data?.total ?? 0;

  const handleConfirmRemove = async () => {
    if (!pendingRemove) return;
    try {
      await removeMutation.mutateAsync([pendingRemove.id]);
      toast.success(t("pages.contact.blocklist.removeSuccess"));
      setPendingRemove(null);
      setConfirmOpen(false);
    } catch {
      toast.error(t("pages.contact.blocklist.removeError"));
    }
  };

  const handleConfirmOpenChange = (open: boolean) => {
    setConfirmOpen(open);
    if (!open) setPendingRemove(null);
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
          emptyMessage={t("pages.contact.blocklist.emptyList")}
          hidePagination={totalRows === 0 && !isPending}
          tableContainerClassName="border-0 rounded-none shadow-none"
          paginationLabels={{
            previous: t("common.pagination.previous"),
            next: t("common.pagination.next"),
          }}
        />
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={handleConfirmOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pages.contact.blocklist.dialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2 text-left">
                <p>{t("pages.contact.blocklist.dialog.description")}</p>
                {pendingRemove ? (
                  <ul className="max-h-40 list-inside list-disc overflow-y-auto text-sm font-medium text-foreground">
                    <li key={pendingRemove.id}>{pendingRemove.name}</li>
                  </ul>
                ) : null}
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
