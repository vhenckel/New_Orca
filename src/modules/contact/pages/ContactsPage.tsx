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
import { Link } from "react-router-dom";
import { parseAsString, throttle, useQueryState } from "nuqs";
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
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { useI18n } from "@/shared/i18n/useI18n";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { usePaginationQueryState } from "@/shared/lib/nuqs-filters";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type {
  AppliedFilter,
  FilterConfig,
} from "@/shared/components/dynamic-filters/types";
import type { PersonContactListItem } from "@/modules/contact/types/person-contact";

function formatContactDate(iso: string): string {
  if (!iso || iso === "-") return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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
  const { t } = useI18n();
  const { page, pageSize, setPagination } = usePaginationQueryState();
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

  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      history: "replace",
      scroll: false,
      limitUrlUpdates: throttle(200),
    }),
  );
  const debouncedSearch = useDebouncedValue(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      setPagination({ page: 1 });
    }
  }, [debouncedSearch, setPagination]);

  const { data, error, isPending } = useContactList({
    page,
    pageSize,
    search: debouncedSearch,
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

  const columns = useMemo<ColumnDef<ContactListItem>[]>(
    () => [
      {
        id: "actions",
        header: () => <span className="block w-full">Ações</span>,
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
            <div className="flex w-full gap-1">
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
        size: 72,
        minSize: 64,
        maxSize: 80,
      },
      {
        id: "name",
        accessorKey: "name",
        header: () => t("pages.debtNegotiation.contacts.col.name"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <OptStatusIcon optStatus={row.original.optStatus} />
            <Link
              to={`/contacts/${row.original.id}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {row.original.name}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "nps",
        header: () => t("pages.debtNegotiation.contacts.col.nps"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.nps != null ? String(row.original.nps) : "-"}
          </span>
        ),
      },
      {
        accessorKey: "whatsapp",
        header: () => t("pages.debtNegotiation.contacts.col.whatsapp"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatWhatsApp(row.original.whatsapp)}
          </span>
        ),
      },
      {
        accessorKey: "firstConversation",
        header: () => t("pages.debtNegotiation.contacts.col.firstConversation"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatContactDate(row.original.firstConversation)}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: () => t("pages.debtNegotiation.contacts.col.updatedAt"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatContactDate(row.original.updatedAt)}
          </span>
        ),
      },
    ],
    [t],
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
