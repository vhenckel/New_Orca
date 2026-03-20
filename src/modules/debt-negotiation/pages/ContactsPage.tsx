import { useMemo, useState } from "react";
import { Check, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { parseAsString, throttle, useQueryState } from "nuqs";

import {
  useContactList,
  CONTACT_LIST_PAGE_SIZE,
} from "@/modules/debt-negotiation/hooks";
import type { ContactListItem } from "@/modules/debt-negotiation/types/contact-list";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import type {
  AppliedFilter,
  FilterConfig,
} from "@/shared/components/dynamic-filters/types";

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

function formatWhatsApp(raw: string): string {
  if (!raw) return "-";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return raw;
  const ddd = digits.slice(-11, -9);
  const rest = digits.slice(-9);
  const part1 = rest.slice(0, 5);
  const part2 = rest.slice(5);
  return `+55 (${ddd}) ${part1}-${part2}`;
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      history: "replace",
      scroll: false,
      limitUrlUpdates: throttle(200),
    }),
  );
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, error, isPending } = useContactList({
    page,
    search: debouncedSearch,
  });

  const filters = useMemo<FilterConfig[]>(() => [], []);
  const appliedFilters = useMemo<AppliedFilter[]>(() => [], []);

  const total = data?.total ?? 0;
  const list = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(total / CONTACT_LIST_PAGE_SIZE));

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.debtNegotiation.routes.contacts.label")}
      subtitle={t("modules.debtNegotiation.routes.contacts.description")}
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
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Erro ao carregar contatos.
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t("pages.debtNegotiation.contacts.col.name")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.contacts.col.nps")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.contacts.col.whatsapp")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.contacts.col.firstConversation")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.contacts.col.updatedAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Carregando…
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            ) : (
              list.map((row: ContactListItem) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <OptStatusIcon optStatus={row.optStatus} />
                      <Link
                        to={`/debt-negotiation/contacts/${row.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {row.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.nps != null ? String(row.nps) : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatWhatsApp(row.whatsapp)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatContactDate(row.firstConversation)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatContactDate(row.updatedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("common.pagination.pageOf")
              .replace("{page}", String(page))
              .replace("{total}", String(totalPages))}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("common.pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("common.pagination.next")}
            </Button>
          </div>
        </div>
      )}
    </DashboardPageLayout>
  );
}
