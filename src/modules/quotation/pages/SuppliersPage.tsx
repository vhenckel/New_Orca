import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";

import { MOCK_SUPPLIERS } from "@/modules/quotation/data/supplierMocks";
import type { SupplierBranchId, SupplierListItem } from "@/modules/quotation/types";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useI18n } from "@/shared/i18n/useI18n";
import { toast } from "@/shared/ui/sonner";

const DEFAULT_RANGE: DateRange = {
  from: new Date(2023, 0, 20),
  to: new Date(2023, 1, 10),
};

function formatCurrencyBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type SortKey = "recent" | "name";
type StatusFilter = "all" | "active" | "inactive";

export function SuppliersPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const dateLocale = locale === "pt-BR" ? ptBR : enUS;

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(DEFAULT_RANGE);
  const [sort, setSort] = useState<SortKey>("recent");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [supplierId, setSupplierId] = useState<string>("all");
  const [branch, setBranch] = useState<SupplierBranchId | "all">("all");

  const rangeLabel = useMemo(() => {
    const from = dateRange?.from;
    const to = dateRange?.to ?? from;
    if (!from || !to) return t("modules.quotation.suppliers.dateRange.pick");
    return `${format(from, "PP", { locale: dateLocale })} — ${format(to, "PP", { locale: dateLocale })}`;
  }, [dateRange, dateLocale, t]);

  const filteredRows = useMemo(() => {
    let rows = [...MOCK_SUPPLIERS];
    if (status === "active") rows = rows.filter((r) => r.isActive);
    if (status === "inactive") rows = rows.filter((r) => !r.isActive);
    if (branch !== "all") rows = rows.filter((r) => r.branch === branch);
    if (supplierId !== "all") rows = rows.filter((r) => r.id === supplierId);

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.contactName.toLowerCase().includes(q) ||
          row.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
          row.phone.toLowerCase().includes(q),
      );
    }

    if (sort === "name") {
      rows.sort((a, b) => a.name.localeCompare(b.name, locale === "pt-BR" ? "pt-BR" : "en-US"));
    }
    return rows;
  }, [search, sort, status, supplierId, branch, locale]);

  const clearFilters = () => {
    setSearch("");
    setDateRange(DEFAULT_RANGE);
    setSort("recent");
    setStatus("all");
    setSupplierId("all");
    setBranch("all");
  };

  const supplierCard = (row: SupplierListItem) => (
    <Card key={row.id} className="flex flex-col overflow-hidden border-border shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap gap-2">
          {row.isActive ? (
            <Badge variant="secondary" className="font-normal">
              {t("modules.quotation.suppliers.badge.active")}
            </Badge>
          ) : (
            <Badge variant="outline" className="font-normal">
              {t("modules.quotation.suppliers.badge.inactive")}
            </Badge>
          )}
          {row.isNew ? (
            <Badge variant="outline" className="border-sky-200 bg-sky-50 font-normal text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
              {t("modules.quotation.suppliers.badge.new")}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="text-lg leading-snug">{row.name}</CardTitle>
      </CardHeader>

      <div className="space-y-2 bg-muted/60 px-6 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("modules.quotation.suppliers.card.sectionCommercial")}
        </p>
        <div className="flex items-start gap-2 text-sm">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>{row.contactName}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>{row.phone}</span>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
          {t("modules.quotation.suppliers.card.sectionPayment")}
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Package className="size-4 shrink-0" aria-hidden />
              {t("modules.quotation.suppliers.card.delivery")}
            </span>
            <span className="font-medium tabular-nums text-foreground">{row.deliveryLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 shrink-0" aria-hidden />
              {t("modules.quotation.suppliers.card.paymentTerm")}
            </span>
            <span className="font-medium tabular-nums text-foreground">{row.paymentTermLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ShoppingCart className="size-4 shrink-0" aria-hidden />
              {t("modules.quotation.suppliers.card.minOrder")}
            </span>
            <span className="font-medium tabular-nums text-foreground">{formatCurrencyBrl(row.minOrderBrl)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t bg-background/80 pt-4">
        <Button
          type="button"
          className="w-full"
          onClick={() => toast.info(t("modules.quotation.suppliers.toast.linkReps"))}
        >
          {t("modules.quotation.suppliers.actions.linkReps")}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={() => navigate(`/suppliers/${row.id}`)}>
          {t("modules.quotation.suppliers.actions.edit")}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.quotation.suppliers.pageTitle")}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 font-normal">
                <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
                <span className="max-w-[min(100vw-8rem,280px)] truncate text-left">{rangeLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from ?? DEFAULT_RANGE.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={dateLocale}
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => toast.info(t("modules.quotation.suppliers.toast.register"))}
          >
            <Plus className="size-4" aria-hidden />
            {t("modules.quotation.suppliers.actions.register")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("modules.quotation.suppliers.searchPlaceholder")}
              className="pl-9"
              aria-label={t("modules.quotation.suppliers.searchPlaceholder")}
            />
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0 gap-1 text-muted-foreground" onClick={clearFilters}>
            <X className="size-4" aria-hidden />
            {t("modules.quotation.suppliers.clearFilters")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger aria-label={t("modules.quotation.suppliers.filterSort")}>
              <SelectValue placeholder={t("modules.quotation.suppliers.sort.recent")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t("modules.quotation.suppliers.sort.recent")}</SelectItem>
              <SelectItem value="name">{t("modules.quotation.suppliers.sort.name")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger aria-label={t("modules.quotation.suppliers.filterStatus.label")}>
              <SelectValue placeholder={t("modules.quotation.suppliers.filterStatus.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("modules.quotation.suppliers.filterStatus.all")}</SelectItem>
              <SelectItem value="active">{t("modules.quotation.suppliers.filterStatus.active")}</SelectItem>
              <SelectItem value="inactive">{t("modules.quotation.suppliers.filterStatus.inactive")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger aria-label={t("modules.quotation.suppliers.filterSupplier.label")}>
              <SelectValue placeholder={t("modules.quotation.suppliers.filterSupplier.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("modules.quotation.suppliers.filterSupplier.all")}</SelectItem>
              {MOCK_SUPPLIERS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={branch} onValueChange={(v) => setBranch(v as SupplierBranchId | "all")}>
            <SelectTrigger aria-label={t("modules.quotation.suppliers.filterBranch.label")}>
              <SelectValue placeholder={t("modules.quotation.suppliers.filterBranch.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("modules.quotation.suppliers.filterBranch.all")}</SelectItem>
              <SelectItem value="matriz">{t("modules.quotation.suppliers.filterBranch.matriz")}</SelectItem>
              <SelectItem value="norte">{t("modules.quotation.suppliers.filterBranch.norte")}</SelectItem>
              <SelectItem value="litoral">{t("modules.quotation.suppliers.filterBranch.litoral")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
            {t("modules.quotation.suppliers.empty")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredRows.map(supplierCard)}</div>
        )}
      </div>
    </DashboardPageLayout>
  );
}
