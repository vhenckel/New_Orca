import { ArrowUpDown, Eye, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MOCK_PRODUCTS } from "@/modules/buyer/product/data/productMocks";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/ui/sonner";

const MAX_BRAND_PILLS = 4;
const MAX_SEGMENT_PILLS = 3;

type SortKey = "name" | "unit";
type UnitFilter = "all" | "un" | "kg";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function BrandPills({ brands, moreLabel }: { brands: string[]; moreLabel: (n: number) => string }) {
  if (brands.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  const vis = brands.slice(0, MAX_BRAND_PILLS);
  const rest = brands.length - vis.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {vis.map((b) => (
        <span
          key={b}
          className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100"
        >
          {b}
        </span>
      ))}
      {rest > 0 ? (
        <Badge variant="secondary" className="font-normal">
          {moreLabel(rest)}
        </Badge>
      ) : null}
    </div>
  );
}

function SegmentPills({
  segments,
  moreLabel,
}: {
  segments: string[];
  moreLabel: (n: number) => string;
}) {
  if (segments.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  const vis = segments.slice(0, MAX_SEGMENT_PILLS);
  const rest = segments.length - vis.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {vis.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-100"
        >
          {s}
        </span>
      ))}
      {rest > 0 ? (
        <Badge variant="secondary" className="font-normal">
          {moreLabel(rest)}
        </Badge>
      ) : null}
    </div>
  );
}

export function ProductsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const catalogCount = MOCK_PRODUCTS.length;
  const segmentOptions = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.flatMap((row) => row.segments))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [],
  );
  const brandOptions = useMemo(
    () =>
      Array.from(new Set(MOCK_PRODUCTS.flatMap((row) => row.brands).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = MOCK_PRODUCTS;

    if (unitFilter !== "all") {
      rows = rows.filter((row) => row.unit === unitFilter);
    }
    if (segmentFilter !== "all") {
      rows = rows.filter((row) => row.segments.includes(segmentFilter));
    }
    if (brandFilter !== "all") {
      rows = rows.filter((row) => row.brands.includes(brandFilter));
    }
    if (!q) return rows;

    return rows.filter((row) => {
      const inBrands = row.brands.some((b) => b.toLowerCase().includes(q));
      const inSeg = row.segments.some((s) => s.toLowerCase().includes(q));
      return (
        row.name.toLowerCase().includes(q) || row.unit.toLowerCase().includes(q) || inBrands || inSeg
      );
    });
  }, [brandFilter, search, segmentFilter, unitFilter]);

  const rows = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = sort.key === "name" ? a.name : a.unit;
      const bv = sort.key === "name" ? b.name : b.unit;
      const cmp = av.localeCompare(bv, "pt-BR", { sensitivity: "base" });
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sort]);
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
  const activeFilterCount = [unitFilter, segmentFilter, brandFilter].filter((value) => value !== "all").length;

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  };
  const clearFilters = () => {
    setSearch("");
    setUnitFilter("all");
    setSegmentFilter("all");
    setBrandFilter("all");
    setPage(1);
  };
  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const onUnitFilterChange = (value: UnitFilter) => {
    setUnitFilter(value);
    setPage(1);
  };
  const onSegmentFilterChange = (value: string) => {
    setSegmentFilter(value);
    setPage(1);
  };
  const onBrandFilterChange = (value: string) => {
    setBrandFilter(value);
    setPage(1);
  };
  const onPageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };
  const paginationLabel = t("modules.product.list.pagination.range", {
    from: fromRow,
    to: toRow,
    total: totalRows,
  });

  const moreLabel = (n: number) => t("modules.product.list.moreCount", { count: n });

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.product.list.pageTitle")}
      subtitle={t("modules.product.list.pageSubtitle", { count: catalogCount })}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="gap-2">
                <Filter className="size-4" />
                {t("modules.product.list.filters")}
                {activeFilterCount > 0 ? (
                  <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[330px] space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                {t("modules.product.list.filtersTitle")}
              </div>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {t("modules.product.list.filter.unit")}
                  </span>
                  <Select value={unitFilter} onValueChange={(value) => onUnitFilterChange(value as UnitFilter)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("modules.product.list.filter.all")}</SelectItem>
                      <SelectItem value="un">un</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {t("modules.product.list.filter.segment")}
                  </span>
                  <Select value={segmentFilter} onValueChange={onSegmentFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("modules.product.list.filter.all")}</SelectItem>
                      {segmentOptions.map((segment) => (
                        <SelectItem key={segment} value={segment}>
                          {segment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {t("modules.product.list.filter.brand")}
                  </span>
                  <Select value={brandFilter} onValueChange={onBrandFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("modules.product.list.filter.all")}</SelectItem>
                      {brandOptions.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
                  {t("modules.product.list.clearFilters")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button type="button" className="gap-2 text-white" onClick={() => toast.success(t("modules.product.list.toastAdd"))}>
            <Plus className="size-4" />
            {t("modules.product.list.addProduct")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("modules.product.list.searchPlaceholder")}
              className="pl-9"
              aria-label={t("modules.product.list.searchPlaceholder")}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("modules.product.list.results", { count: totalRows })}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">{t("modules.product.list.table.index")}</TableHead>
                <TableHead>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2 gap-1 font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    {t("modules.product.list.table.product")}
                    <ArrowUpDown
                      className={cn("size-3.5 opacity-60", sort.key === "name" && "opacity-100")}
                    />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2 gap-1 font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => toggleSort("unit")}
                  >
                    {t("modules.product.list.table.unit")}
                    <ArrowUpDown
                      className={cn("size-3.5 opacity-60", sort.key === "unit" && "opacity-100")}
                    />
                  </Button>
                </TableHead>
                <TableHead>{t("modules.product.list.table.brands")}</TableHead>
                <TableHead>{t("modules.product.list.table.segments")}</TableHead>
                <TableHead className="w-[72px] text-right">
                  {t("modules.product.list.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("modules.product.list.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => navigate(`/products/${row.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/products/${row.id}`);
                      }
                    }}
                  >
                    <TableCell className="tabular-nums text-muted-foreground">{fromRow + index}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.unit}</TableCell>
                    <TableCell>
                      <BrandPills brands={row.brands} moreLabel={moreLabel} />
                    </TableCell>
                    <TableCell>
                      <SegmentPills segments={row.segments} moreLabel={moreLabel} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Eye className="ml-auto size-4 text-muted-foreground" aria-hidden />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("modules.product.list.pagination.rowsPerPage")}</span>
            <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
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
