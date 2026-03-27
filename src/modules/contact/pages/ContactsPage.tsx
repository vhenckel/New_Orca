import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Ban,
  Check,
  Clock,
  MessageCircle,
  Pencil,
  Send,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AddToBlocklistDialog } from "@/modules/contact/components/AddToBlocklistDialog";
import { EditContactDrawer } from "@/modules/contact/components/EditContactDrawer";
import {
  useContactList,
  usePersonContactCluster,
} from "@/modules/contact/hooks";
import type { ContactListItem } from "@/modules/contact/types/contact-list";
import { formatWhatsApp } from "@/modules/contact/utils/format-whatsapp";
import { ConversationHistoryDialog } from "@/modules/debt-negotiation/components/ConversationHistoryDialog";
import { PermissionGuard } from "@/shared/auth/PermissionGuard";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { DataTable } from "@/shared/components/data-table";
import { NameDocumentCell } from "@/shared/components/data-table/NameDocumentCell";
import { SortHeader } from "@/shared/components/data-table/SortHeader";
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { useI18n } from "@/shared/i18n/useI18n";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { formatContactListDate } from "@/shared/lib/format-contact-list-date";
import { useContactsListTableQueryState } from "@/shared/lib/nuqs-filters";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type {
  AppliedFilter,
  FilterConfig,
} from "@/shared/components/dynamic-filters/types";
import type { PersonContactListItem } from "@/modules/contact/types/person-contact";

/** optStatus === 1 = usuário de acordo (LGPD/opt-in). */
function OptStatusIcon({ optStatus }: { optStatus: number }) {
  const agreed = optStatus === 1;
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
        agreed
          ? "bg-green-600 text-white"
          : "bg-destructive text-destructive-foreground",
      )}
      title={agreed ? "Opt-in confirmado" : "Aguardando opt-in"}
    >
      {agreed ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
    </span>
  );
}

export function ContactsPage() {
  const { t, locale } = useI18n();
  const {
    page,
    pageSize,
    orderBy,
    orderDirection,
    search,
    setSearch,
    setParams,
    setPagination,
  } = useContactsListTableQueryState();
  const [selectedContact, setSelectedContact] = useState<{
    id: number;
    name: string;
    whatsapp: string;
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [blocklistOpen, setBlocklistOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const { data: personCluster } = usePersonContactCluster(
    selectedContact?.id ?? null,
  );

  const debouncedSearch = useDebouncedValue(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      setParams({
        page: 1,
        q: debouncedSearch || null,
      });
    }
  }, [debouncedSearch, setParams]);

  const { data, error, isPending } = useContactList({
    page,
    pageSize,
    search: debouncedSearch,
    orderBy,
    orderDirection,
  });

  const filters = useMemo<FilterConfig[]>(() => [], []);
  const appliedFilters = useMemo<AppliedFilter[]>(() => [], []);

  const linkedContacts = personCluster?.contacts ?? [];
  const blocklistCandidates = useMemo<PersonContactListItem[]>(() => {
    if (linkedContacts.length > 0) return linkedContacts;
    if (!selectedContact) return [];
    return [
      {
        id: selectedContact.id,
        name: selectedContact.name,
        appkey: selectedContact.whatsapp || null,
        main: true,
        isInBlackList: false,
      },
    ];
  }, [linkedContacts, selectedContact]);

  const toggleSort = (next: string) => {
    const nextDir =
      orderBy !== next ? "ASC" : orderDirection === "ASC" ? "DESC" : "ASC";
    setParams({
      page: 1,
      contactsOrderBy: next,
      contactsOrderDir: nextDir,
      q: search || null,
    });
  };

  const columns = useMemo<ColumnDef<ContactListItem>[]>(
    () => [
      {
        id: "actions",
        meta: {
          headerClassName: "w-[90px] max-w-[100px] text-left",
          cellClassName: "w-[90px] max-w-[100px] text-left",
        },
        header: () => t("pages.debtNegotiation.contacts.col.actions"),
        cell: ({ row }) => {
          const contactId = Number(row.original.id);
          const contactName = row.original.name;
          const contactWhatsapp = row.original.whatsapp;
          const canOpen = Number.isFinite(contactId) && contactId > 0;

          const select = () => {
            if (!canOpen) return;
            setSelectedContact({
              id: contactId,
              name: contactName,
              whatsapp: contactWhatsapp,
            });
          };

          return (
            <div className="flex shrink-0 flex-nowrap gap-1">
              <PermissionGuard
                permissionNames={["editar"]}
                moduleName="contatos"
                subModuleName="contatos"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                      aria-label="Editar"
                      disabled={!canOpen}
                      onClick={() => {
                        select();
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Editar</TooltipContent>
                </Tooltip>
              </PermissionGuard>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <button
                      type="button"
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                      aria-label="Enviar"
                      disabled
                      onClick={() => {}}
                    >
                      <Send className="size-4" />
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Enviar (em breve)</TooltipContent>
              </Tooltip>

              <PermissionGuard
                permissionNames={["mover_para_blocklist"]}
                moduleName="contatos"
                subModuleName="contatos"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                      aria-label={t("pages.contact.addToBlocklist.button")}
                      disabled={!canOpen}
                      onClick={() => {
                        select();
                        setBlocklistOpen(true);
                      }}
                    >
                      <Ban className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("pages.contact.addToBlocklist.button")}
                  </TooltipContent>
                </Tooltip>
              </PermissionGuard>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    aria-label={t(
                      "pages.debtNegotiation.contactDetail.viewConversation",
                    )}
                    disabled={!canOpen}
                    onClick={() => {
                      select();
                      setConversationOpen(true);
                    }}
                  >
                    <MessageCircle className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("pages.debtNegotiation.contactDetail.viewConversation")}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
        size: 100,
        minSize: 120,
        maxSize: 140,
      },
      {
        id: "name",
        accessorKey: "name",
        meta: {
          /** Alinha o título com o texto do nome (após ícone opt + gap). */
          headerClassName: "pl-11 pr-4 text-left",
        },
        size: 220,
        minSize: 160,
        maxSize: 360,
        header: () => t("pages.debtNegotiation.contacts.col.name"),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <OptStatusIcon optStatus={row.original.optStatus} />
            <div className="min-w-0 flex-1">
              <NameDocumentCell
                name={row.original.name}
                href={`/contacts/${row.original.id}`}
                cpf={row.original.cpf}
                cnpj={row.original.cnpj}
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "nps",
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
        size: 72,
        maxSize: 88,
        header: () => t("pages.debtNegotiation.contacts.col.nps"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.nps != null ? String(row.original.nps) : "-"}
          </span>
        ),
      },
      {
        accessorKey: "whatsapp",
        size: 168,
        minSize: 148,
        header: () => t("pages.debtNegotiation.contacts.col.whatsapp"),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatWhatsApp(row.original.whatsapp)}
          </span>
        ),
      },
      {
        accessorKey: "firstConversation",
        size: 160,
        minSize: 140,
        header: () => (
          <SortHeader
            variant="compact"
            label={t("pages.debtNegotiation.contacts.col.firstConversation")}
            active={orderBy === "firstConversation"}
            direction={orderDirection}
            onClick={() => toggleSort("firstConversation")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatContactListDate(row.original.firstConversation, locale)}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        size: 160,
        minSize: 140,
        header: () => (
          <SortHeader
            variant="compact"
            label={t("pages.debtNegotiation.contacts.col.updatedAt")}
            active={orderBy === "updatedAt"}
            direction={orderDirection}
            onClick={() => toggleSort("updatedAt")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatContactListDate(row.original.updatedAt, locale)}
          </span>
        ),
      },
    ],
    [locale, orderBy, orderDirection, t],
  );

  const totalRows = data?.total ?? 0;

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.contact.routes.list.label")}
      subtitle={t("modules.contact.routes.list.description")}
    >
      <FilterPanel
        showSearch
        searchValue={search}
        onSearchChange={(value) => void setSearch(value)}
        searchPlaceholder={t("pages.debtNegotiation.contacts.search")}
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
            {t("pages.debtNegotiation.contacts.errors.loadList")}
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
          getRowId={(row) => row.id}
          emptyMessage={t("pages.debtNegotiation.contacts.emptyList")}
          hidePagination={totalRows === 0 && !isPending}
          tableContainerClassName="border-0 rounded-none shadow-none"
          paginationLabels={{
            previous: t("common.pagination.previous"),
            next: t("common.pagination.next"),
          }}
        />
      </div>

      {selectedContact ? (
        <>
          <EditContactDrawer
            open={editOpen}
            onOpenChange={setEditOpen}
            contactId={selectedContact.id}
            linkedContacts={linkedContacts}
            fallbackPhone={selectedContact.whatsapp || null}
          />

          <AddToBlocklistDialog
            open={blocklistOpen}
            onOpenChange={setBlocklistOpen}
            anchorContactId={selectedContact.id}
            candidates={blocklistCandidates}
          />

          <ConversationHistoryDialog
            contactId={selectedContact.id}
            contactName={selectedContact.name}
            open={conversationOpen}
            onOpenChange={setConversationOpen}
          />
        </>
      ) : null}
    </DashboardPageLayout>
  );
}
