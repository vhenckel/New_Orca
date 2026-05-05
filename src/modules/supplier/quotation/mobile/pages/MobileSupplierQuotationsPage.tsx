import { ArrowUpDown, Eye, Filter, Pencil, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";

import {
  SUPPLIER_QUOTATION_LIST_MOCKS,
  type SupplierQuotationListItem,
  type SupplierQuotationStatus,
} from "@/modules/supplier/quotation/data/supplierQuotationMocks";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";

const STATUS_OPTIONS: SupplierQuotationStatus[] = [
  "pending",
  "in_progress",
  "attention",
  "responded",
];

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

function actionLabelKey(action: SupplierQuotationListItem["action"]) {
  return action === "quote"
    ? "modules.supplierPortal.quotation.list.actions.quoteNow"
    : "modules.supplierPortal.quotation.list.actions.viewResponse";
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

export function MobileSupplierQuotationsPage() {
  const { t } = useI18n();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<SupplierQuotationStatus[]>([]);

  const [query, setQuery] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      order: parseAsStringLiteral(["asc", "desc"] as const).withDefault("asc"),
      st: parseAsString.withDefault(""),
    },
    { history: "push" },
  );

  const statusFilters = useMemo(() => {
    if (!query.st) return [] as SupplierQuotationStatus[];
    return query.st.split(",").filter((s): s is SupplierQuotationStatus =>
      STATUS_OPTIONS.includes(s as SupplierQuotationStatus),
    );
  }, [query.st]);

  const setStatusFilters = (next: SupplierQuotationStatus[]) => {
    setQuery(
      { st: next.length ? next.join(",") : null },
    );
  };

  const filtered = useMemo(() => {
    const q = query.q.trim().toLowerCase();
    let list = SUPPLIER_QUOTATION_LIST_MOCKS.filter((row) => {
      if (statusFilters.length > 0 && !statusFilters.includes(row.status)) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.restaurantName.toLowerCase().includes(q) ||
        row.contactEmail.toLowerCase().includes(q) ||
        row.city.toLowerCase().includes(q) ||
        row.categories.some((c) => c.toLowerCase().includes(q))
      );
    });
    list = [...list].sort((a, b) => {
      const ta = new Date(a.deadlineAt).getTime();
      const tb = new Date(b.deadlineAt).getTime();
      return query.order === "asc" ? ta - tb : tb - ta;
    });
    return list;
  }, [query.q, query.order, statusFilters]);

  const onApplyFilters = () => {
    setStatusFilters(localStatus);
    setFiltersOpen(false);
  };

  const onOpenFiltersChange = (open: boolean) => {
    setFiltersOpen(open);
    if (open) {
      setLocalStatus(statusFilters);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full flex-col gap-2">
        <Input
          value={query.q}
          onChange={(e) => setQuery({ q: e.target.value || null })}
          placeholder={t("modules.supplierPortal.quotation.list.searchPlaceholder")}
          className="h-10"
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="flex min-w-0">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => {
                setSortOpen(true);
              }}
              aria-label={t("modules.supplierPortal.quotation.mobile.sortButton")}
            >
              <ArrowUpDown className="size-4 shrink-0" aria-hidden />
              {t("modules.supplierPortal.quotation.mobile.sortButton")}
            </Button>
            <Sheet open={sortOpen} onOpenChange={setSortOpen}>
              <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl">
                <SheetHeader className="text-left">
                  <SheetTitle>{t("modules.supplierPortal.quotation.mobile.sortTitle")}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 py-2">
                  <Button
                    type="button"
                    variant={query.order === "asc" ? "default" : "outline"}
                    className="h-12 justify-start"
                    onClick={() => {
                      setQuery({ order: "asc" });
                      setSortOpen(false);
                    }}
                  >
                    {t("modules.supplierPortal.quotation.list.sortByDeadline")} — ↑
                  </Button>
                  <Button
                    type="button"
                    variant={query.order === "desc" ? "default" : "outline"}
                    className="h-12 justify-start"
                    onClick={() => {
                      setQuery({ order: "desc" });
                      setSortOpen(false);
                    }}
                  >
                    {t("modules.supplierPortal.quotation.list.sortByDeadline")} — ↓
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Sheet open={filtersOpen} onOpenChange={onOpenFiltersChange}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                aria-label={t("modules.supplierPortal.quotation.mobile.filtersButton")}
              >
                <Filter className="size-4 shrink-0" aria-hidden />
                {t("modules.supplierPortal.quotation.mobile.filtersButton")}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
              <SheetHeader className="text-left">
                <SheetTitle>{t("modules.supplierPortal.quotation.mobile.filtersTitle")}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 py-2">
                <p className="text-xs text-muted-foreground">
                  {t("modules.supplierPortal.quotation.list.statusFilterLabel")}
                </p>
                <div className="flex flex-col gap-3">
                  {STATUS_OPTIONS.map((s) => (
                    <div key={s} className="flex items-center justify-between gap-2">
                      <Label htmlFor={`m-st-${s}`} className="text-sm font-normal">
                        {t(`modules.supplierPortal.quotation.list.status.${s}` as const)}
                      </Label>
                      <Checkbox
                        id={`m-st-${s}`}
                        checked={localStatus.includes(s)}
                        onCheckedChange={() => {
                          setLocalStatus((prev) =>
                            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <SheetFooter>
                <Button type="button" className="w-full" onClick={onApplyFilters}>
                  {t("modules.supplierPortal.quotation.mobile.apply")}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-1 py-8 text-center text-sm text-muted-foreground">
          {t("modules.supplierPortal.quotation.list.empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((row) => (
            <Card key={row.id} className="overflow-hidden border-border shadow-sm">
              <CardContent className="p-0">
                <p className="bg-muted/40 py-2 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                  {row.id}
                </p>
                <div className="flex flex-col divide-y divide-border">
                  <InfoRow
                    label={t("modules.supplierPortal.quotation.detail.restaurant.establishmentName")}
                    value={row.restaurantName}
                  />
                  <InfoRow
                    label={t("modules.supplierPortal.quotation.mobile.deadlineLabel")}
                    value={formatDateTime(row.deadlineAt)}
                    emphasize
                  />
                  <InfoRow
                    label={t("modules.supplierPortal.quotation.mobile.deliveryTimeLabel")}
                    value={row.deliveryLabel}
                  />
                  <div className="flex flex-col gap-2 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      {t("modules.supplierPortal.quotation.list.table.status")}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "inline-flex w-fit items-center gap-1.5 border font-medium",
                        statusBadgeClass(row.status),
                      )}
                    >
                      {row.status === "attention" ? (
                        <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
                      ) : null}
                      {t(`modules.supplierPortal.quotation.list.status.${row.status}` as const)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      {t("modules.supplierPortal.quotation.list.table.progress")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t("modules.supplierPortal.quotation.list.table.progressLabel")}
                    </p>
                    <Progress value={row.progress} className="h-2" />
                    <p className="text-xs font-medium tabular-nums text-foreground">{row.progress}%</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 p-3">
                  <Button
                    asChild
                    size="default"
                    className="min-w-[7rem] gap-1.5 bg-primary text-white hover:bg-primary/90 hover:text-white"
                  >
                    <Link to={`/m/supplier/quotations/${row.id}`}>
                      {row.action === "quote" ? (
                        <Pencil className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                      {t(actionLabelKey(row.action))}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm",
          emphasize ? "font-medium text-foreground" : "text-foreground/90",
        )}
      >
        {value}
      </span>
    </div>
  );
}
