import { ArrowUpDown, Filter, Search, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  SUPPLIER_QUOTATION_LIST_MOCKS,
  type SupplierQuotationListItem,
  type SupplierQuotationStatus,
} from "@/modules/supplier/quotation/data/supplierQuotationMocks";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Progress } from "@/shared/ui/progress";
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

const STATUS_OPTIONS: SupplierQuotationStatus[] = ["pending", "in_progress", "attention", "responded"];
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const SEGMENT_BADGE_CLASS = "border-amber-200 bg-amber-50 text-amber-900";
const OVERFLOW_BADGE_CLASS = "min-w-7 justify-center border-sky-200 bg-sky-50 px-2 text-sky-800";

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: SupplierQuotationStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "in_progress":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "responded":
      return "bg-green-100 text-green-700 border-green-200";
    case "attention":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function actionLabelKey(action: SupplierQuotationListItem["action"]) {
  return action === "quote" ? "modules.supplierPortal.quotation.list.actions.quoteNow" : "modules.supplierPortal.quotation.list.actions.viewResponse";
}

function CategoryBadges({ categories }: { categories: string[] }) {
  const visible = categories.slice(0, 3);
  const overflow = categories.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((category, index) => (
        <Badge
          key={`${category}-${index}`}
          variant="outline"
          className={cn("rounded-full font-medium", SEGMENT_BADGE_CLASS)}
        >
          {category}
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge variant="outline" className={cn("rounded-full font-semibold tabular-nums", OVERFLOW_BADGE_CLASS)}>
          +{overflow}
        </Badge>
      ) : null}
    </div>
  );
}

export function SupplierQuotationsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<SupplierQuotationStatus[]>([]);
  const [sortByClosestDeadline, setSortByClosestDeadline] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const activeStatusCount = statusFilters.length;
  const statusSummary =
    activeStatusCount === 0
      ? t("modules.supplierPortal.quotation.list.statusAll")
      : t("modules.supplierPortal.quotation.list.statusSelected", { count: activeStatusCount });

  const toggleStatus = (status: SupplierQuotationStatus) => {
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

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const baseRows = SUPPLIER_QUOTATION_LIST_MOCKS.filter((row) => {
      const byStatus =
        statusFilters.length === 0 ? true : statusFilters.includes(row.status);
      if (!byStatus) return false;
      if (!query) return true;
      return (
        String(row.id).includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.restaurantName.toLowerCase().includes(query) ||
        row.city.toLowerCase().includes(query) ||
        row.categories.some((c) => c.toLowerCase().includes(query)) ||
        row.status.toLowerCase().includes(query)
      );
    });

    return [...baseRows].sort((a, b) => {
      if (!sortByClosestDeadline) return b.id - a.id;
      return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
    });
  }, [search, sortByClosestDeadline, statusFilters]);

  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(pageStart, pageStart + pageSize);
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

  const paginationLabel = t("modules.supplierPortal.quotation.list.pagination.range", {
    from: fromRow,
    to: toRow,
    total: totalRows,
  });

  const openRows = SUPPLIER_QUOTATION_LIST_MOCKS.filter((row) => row.status !== "responded");
  const pendingCount = openRows.length;
  const highPriorityCount = openRows.filter((row) => row.priority === "high").length;
  const itemsToQuote = openRows.reduce((acc, row) => acc + row.requestedItems, 0);

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.supplierPortal.quotation.list.pageTitle")}
      subtitle={t("modules.supplierPortal.quotation.list.pageSubtitle")}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t("modules.supplierPortal.quotation.list.kpis.pending")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tabular-nums">{pendingCount}</span>
              <span className="text-xs text-muted-foreground">
                {t("modules.supplierPortal.quotation.list.kpis.pendingHint")}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t("modules.supplierPortal.quotation.list.kpis.highPriority")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tabular-nums">{highPriorityCount}</span>
              <span className="text-xs text-muted-foreground">
                {t("modules.supplierPortal.quotation.list.kpis.highPriorityHint")}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t("modules.supplierPortal.quotation.list.kpis.itemsToQuote")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tabular-nums">{itemsToQuote}</span>
              <span className="text-xs text-muted-foreground">
                {t("modules.supplierPortal.quotation.list.kpis.itemsToQuoteHint")}
              </span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder={t("modules.supplierPortal.quotation.list.searchPlaceholder")}
                  className="pl-9"
                  aria-label={t("modules.supplierPortal.quotation.list.searchPlaceholder")}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="gap-2">
                      <Filter data-icon="inline-start" />
                      {t("modules.supplierPortal.quotation.list.advancedFilters")}
                      {activeStatusCount > 0 ? (
                        <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                          {activeStatusCount}
                        </Badge>
                      ) : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="flex w-[320px] flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <SlidersHorizontal className="text-muted-foreground" />
                      {t("modules.supplierPortal.quotation.list.filtersTitle")}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-muted-foreground">
                        {t("modules.supplierPortal.quotation.list.statusFilterLabel")}
                      </p>
                      {STATUS_OPTIONS.map((status) => (
                        <label key={status} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1">
                          <Checkbox
                            checked={statusFilters.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                            aria-label={t(`modules.supplierPortal.quotation.list.status.${status}`)}
                          />
                          <span className="text-sm">{t(`modules.supplierPortal.quotation.list.status.${status}`)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{statusSummary}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={clearStatusFilters}>
                        {t("modules.supplierPortal.quotation.list.clearStatusFilters")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button type="button" variant="ghost" size="sm" onClick={clearAllFilters}>
                  {t("modules.supplierPortal.quotation.list.clearFilters")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSortByClosestDeadline((prev) => !prev);
                    setPage(1);
                  }}
                >
                  <ArrowUpDown data-icon="inline-start" />
                  {t("modules.supplierPortal.quotation.list.sortByDeadline")}
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("modules.supplierPortal.quotation.list.table.order")}</TableHead>
                  <TableHead>{t("modules.supplierPortal.quotation.list.table.restaurant")}</TableHead>
                  <TableHead>{t("modules.supplierPortal.quotation.list.table.deadline")}</TableHead>
                  <TableHead>{t("modules.supplierPortal.quotation.list.table.progress")}</TableHead>
                  <TableHead>{t("modules.supplierPortal.quotation.list.table.status")}</TableHead>
                  <TableHead className="text-right">{t("modules.supplierPortal.quotation.list.table.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {t("modules.supplierPortal.quotation.list.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Link to={`/supplier/quotations/${row.id}`} className="font-semibold hover:underline">
                            #{row.id}
                          </Link>
                          <p className="text-sm text-muted-foreground">{row.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.requestedItems} {t("modules.supplierPortal.quotation.list.table.itemsCount")} · {row.estimatedTotal}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{row.restaurantName}</p>
                          <p className="text-xs text-muted-foreground">{row.contactEmail}</p>
                          <p className="text-xs text-muted-foreground">{row.city}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{formatDateTime(row.deadlineAt)}</p>
                          <p className="text-xs text-muted-foreground">{row.deliveryLabel}</p>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">{t("modules.supplierPortal.quotation.list.table.progressLabel")}</p>
                          <Progress value={row.progress} className="h-2" />
                          <p className="text-xs font-medium tabular-nums">{row.progress}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border", statusBadgeClass(row.status))}>
                          {row.status === "attention" ? <TriangleAlert data-icon="inline-start" /> : null}
                          {t(`modules.supplierPortal.quotation.list.status.${row.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          size="sm"
                          variant={row.action === "quote" ? "default" : "outline"}
                          className={
                            row.action === "quote"
                              ? "bg-primary text-white hover:bg-primary/90 hover:text-white"
                              : undefined
                          }
                        >
                          <Link to={`/supplier/quotations/${row.id}`}>{t(actionLabelKey(row.action))}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t("modules.supplierPortal.quotation.list.pagination.rowsPerPage")}</span>
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
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
