import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { MOCK_QUOTATIONS, matchesStatus } from "@/modules/buyer/quotation/data/quotationMocks";
import type { QuotationStatus } from "@/modules/buyer/quotation/types";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useI18n } from "@/shared/i18n/useI18n";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const STATUS_OPTIONS: QuotationStatus[] = ["open", "waiting", "finished"];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: QuotationStatus) {
  if (status === "open") return "border-sky-200 bg-sky-50 text-sky-800";
  if (status === "waiting") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

export function QuotationsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<QuotationStatus[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const activeStatusCount = statusFilters.length;
  const statusSummary =
    activeStatusCount === 0
      ? t("modules.quotation.quotations.statusAll")
      : t("modules.quotation.quotations.statusSelected", { count: activeStatusCount });

  const toggleStatus = (status: QuotationStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status],
    );
    setPage(1);
  };
  const clearStatusFilters = () => {
    setStatusFilters([]);
    setPage(1);
  };
  const clearAllFilters = () => {
    setSearch("");
    setStatusFilters([]);
    setPage(1);
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filteredByStatus =
      statusFilters.length === 0
        ? MOCK_QUOTATIONS
        : MOCK_QUOTATIONS.filter((row) => statusFilters.some((status) => matchesStatus(row, status)));
    return filteredByStatus.filter((row) => {
      if (!q) return true;
      return (
        String(row.id).includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.total.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilters]);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedRows = rows.slice(pageStart, pageStart + pageSize);
  const fromRow = totalRows === 0 ? 0 : pageStart + 1;
  const toRow = totalRows === 0 ? 0 : Math.min(pageStart + pageSize, totalRows);
  const pageItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items = [1];
    if (currentPage > 3) items.push(-1);
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p += 1) {
      items.push(p);
    }
    if (currentPage < totalPages - 2) items.push(-2);
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);
  const paginationLabel = t("modules.quotation.quotations.pagination.range", {
    from: fromRow,
    to: toRow,
    total: totalRows,
  });

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.quotation.quotations.pageTitle")}
      subtitle={t("modules.quotation.quotations.pageSubtitle")}
      headerActions={
        <Button asChild className="gap-2 text-white">
          <Link to="/quotations/new">
            <Plus className="size-4" />
            {t("modules.quotation.quotations.addButton")}
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("modules.quotation.quotations.searchPlaceholder")}
              className="pl-9"
              aria-label={t("modules.quotation.quotations.searchPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="gap-2">
                  <Filter className="size-4" />
                  {t("modules.quotation.quotations.advancedFilters")}
                  {activeStatusCount > 0 ? (
                    <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                      {activeStatusCount}
                    </Badge>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[320px] space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  {t("modules.quotation.quotations.filtersTitle")}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{t("modules.quotation.quotations.statusFilterLabel")}</p>
                  {STATUS_OPTIONS.map((status) => (
                    <label key={status} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1">
                      <Checkbox
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => toggleStatus(status)}
                        aria-label={t(`modules.quotation.quotations.status.${status}`)}
                      />
                      <span className="text-sm">{t(`modules.quotation.quotations.status.${status}`)}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{statusSummary}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={clearStatusFilters}>
                    {t("modules.quotation.quotations.clearStatusFilters")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button type="button" variant="ghost" size="sm" onClick={clearAllFilters}>
              {t("modules.quotation.quotations.clearFilters")}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>{t("modules.quotation.quotations.table.title")}</TableHead>
                <TableHead>{t("modules.quotation.quotations.table.status")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("modules.quotation.quotations.table.createdAt")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("modules.quotation.quotations.table.deadline")}
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  {t("modules.quotation.quotations.table.responses")}
                </TableHead>
                <TableHead className="text-right">{t("modules.quotation.quotations.table.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {t("modules.quotation.quotations.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/quotations/${row.id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {row.id}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to={`/quotations/${row.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(row.status)}>
                        {t(`modules.quotation.quotations.status.${row.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {formatDateTime(row.deadlineAt)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">{row.responses}</TableCell>
                    <TableCell className="text-right font-semibold">{row.total}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("modules.quotation.quotations.pagination.rowsPerPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[84px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">{paginationLabel}</p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {t("common.pagination.previous")}
            </Button>
            {pageItems.map((item, idx) =>
              item < 0 ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={item === currentPage ? "default" : "outline"}
                  onClick={() => setPage(item)}
                  className={cn("min-w-9", item === currentPage && "text-white")}
                >
                  {item}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t("common.pagination.next")}
            </Button>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
