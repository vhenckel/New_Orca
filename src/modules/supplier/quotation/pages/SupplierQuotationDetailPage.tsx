import {
  ArrowLeft,
  CalendarClock,
  Clock,
  FileText,
  Package,
  Plus,
  Save,
  Send,
  StickyNote,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getSupplierQuotationDetail,
} from "@/modules/supplier/quotation/data/supplierQuotationMocks";
import {
  createLineResponsesInitial,
  getFixedBrandLabelForLine,
  getItemMaxLineSubtotalBRL,
  getItemPriceLineKeys,
  itemHasAnyPricedLine,
  parseMoneyBRL,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldContent, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Textarea } from "@/shared/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/ui/sonner";

type ItemResponseState = Record<string, { unitPrice: string; customBrand?: string }>;

type PackagingUnit = "ml" | "l" | "g" | "kg" | "un";

interface AlternativeQuotationLine {
  id: string;
  parentItemId: string;
  brand: string;
  packagingAmount: string;
  packagingUnit: PackagingUnit;
}

function formatPackagingDisplay(amount: string, unit: PackagingUnit): string {
  const suffix = { ml: "ml", l: "L", g: "g", kg: "kg", un: "un" }[unit];
  return `${amount} ${suffix}`;
}

const SEGMENT_BADGE_CLASS = "border-sky-200 bg-sky-50 text-sky-800";
const OVERFLOW_BADGE_CLASS = "min-w-7 justify-center border-muted bg-muted/60 px-2 text-muted-foreground";

function formatShortDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Valor para `input type="date"` no fuso local. */
function toDateInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function SegmentBadges({ segments }: { segments: string[] }) {
  const shouldShowSingleBadge = (segments[0]?.length ?? 0) > 16;
  const visibleCount = shouldShowSingleBadge ? 1 : 2;
  const visible = segments.slice(0, visibleCount);
  const hidden = segments.slice(visibleCount);
  const overflow = segments.length - visible.length;
  return (
    <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
      {visible.map((segment, index) => (
        <Badge
          key={`${segment}-${index}`}
          variant="outline"
          className={cn(
            "shrink-0 rounded-full font-medium",
            !shouldShowSingleBadge && "max-w-[110px] truncate",
            SEGMENT_BADGE_CLASS,
          )}
        >
          {segment}
        </Badge>
      ))}
      {overflow > 0 ? (
        <TooltipProvider delayDuration={120}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Badge
                  variant="outline"
                  className={cn("cursor-default rounded-full font-semibold tabular-nums", OVERFLOW_BADGE_CLASS)}
                >
                  +{overflow}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hidden.join(", ")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}

function detailStatusLabelKey(status: string) {
  if (status === "pending") return "modules.supplierPortal.quotation.detail.statusBadge.pendingQuote";
  return `modules.supplierPortal.quotation.list.status.${status}`;
}

export function SupplierQuotationDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const detail = useMemo(() => getSupplierQuotationDetail(id), [id]);

  const [responses, setResponses] = useState<ItemResponseState>({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [commercialTerms, setCommercialTerms] = useState({
    paymentMethod: "",
    paymentDeadline: "",
    delivery: "",
    quotationValidUntil: "",
  });
  const [alternativeLines, setAlternativeLines] = useState<AlternativeQuotationLine[]>([]);
  const [variationSheetOpen, setVariationSheetOpen] = useState(false);
  const [variationParentId, setVariationParentId] = useState<string | null>(null);
  const [variationBrand, setVariationBrand] = useState("");
  const [variationPackagingQty, setVariationPackagingQty] = useState("");
  const [variationPackagingUnit, setVariationPackagingUnit] = useState<PackagingUnit>("ml");

  useEffect(() => {
    if (!detail) return;
    setResponses(createLineResponsesInitial(detail.items));
    setGeneralNotes(detail.generalNotes);
    setAlternativeLines([]);
    setCommercialTerms({
      paymentMethod: detail.paymentMethodLabel,
      paymentDeadline: detail.paymentDeadlineLabel,
      delivery: detail.deliveryWindowLabel,
      quotationValidUntil: toDateInputValue(detail.quotationValidUntilAt),
    });
  }, [detail]);

  const filledItems = useMemo(() => {
    if (!detail) return 0;
    return detail.items.filter((item) => itemHasAnyPricedLine(item, responses)).length;
  }, [detail, responses]);

  const hasAnyQuotedPrice = useMemo(() => {
    if (!detail) return false;
    for (const item of detail.items) {
      if (itemHasAnyPricedLine(item, responses)) return true;
    }
    for (const alt of alternativeLines) {
      if (parseMoneyBRL(responses[alt.id]?.unitPrice ?? "") != null) return true;
    }
    return false;
  }, [detail, responses, alternativeLines]);

  const completionPercent =
    detail && detail.items.length > 0 ? Math.round((filledItems / detail.items.length) * 100) : 0;

  const estimatedTotal = useMemo(() => {
    if (!detail) return 0;
    let acc = detail.items.reduce(
      (sum, item) => sum + getItemMaxLineSubtotalBRL(item, responses),
      0,
    );
    for (const alt of alternativeLines) {
      const parent = detail.items.find((i) => i.id === alt.parentItemId);
      if (!parent) continue;
      const parsed = parseMoneyBRL(responses[alt.id]?.unitPrice ?? "");
      if (parsed === null) continue;
      acc += parsed * parent.quantity;
    }
    return acc;
  }, [detail, responses, alternativeLines]);

  const estimatedTotalLabel = estimatedTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleUnitPriceChange = (lineKey: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [lineKey]: {
        ...prev[lineKey],
        unitPrice: value,
      },
    }));
  };

  const handleCustomBrandChange = (lineKey: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [lineKey]: {
        ...prev[lineKey],
        customBrand: value,
      },
    }));
  };

  const openVariationSheet = (parentItemId: string) => {
    setVariationParentId(parentItemId);
    setVariationBrand("");
    setVariationPackagingQty("");
    setVariationPackagingUnit("ml");
    setVariationSheetOpen(true);
  };

  const handleVariationSheetOpenChange = (open: boolean) => {
    setVariationSheetOpen(open);
    if (!open) setVariationParentId(null);
  };

  const handleSaveVariation = () => {
    if (!variationParentId || !variationBrand.trim() || !variationPackagingQty.trim()) {
      toast.error(t("modules.supplierPortal.quotation.detail.items.sheetValidation"));
      return;
    }
    const id = `alt-${variationParentId}-${crypto.randomUUID()}`;
    setAlternativeLines((prev) => [
      ...prev,
      {
        id,
        parentItemId: variationParentId,
        brand: variationBrand.trim(),
        packagingAmount: variationPackagingQty.trim(),
        packagingUnit: variationPackagingUnit,
      },
    ]);
    setResponses((prev) => ({
      ...prev,
      [id]: { unitPrice: "", customBrand: "" },
    }));
    setVariationSheetOpen(false);
    setVariationParentId(null);
  };

  const handleRemoveVariation = (alternativeId: string) => {
    setAlternativeLines((prev) => prev.filter((line) => line.id !== alternativeId));
    setResponses((prev) => {
      const next = { ...prev };
      delete next[alternativeId];
      return next;
    });
  };

  const handleSaveDraft = () => {
    toast.success(t("modules.supplierPortal.quotation.detail.toastDraft"));
  };

  const handleSendQuotation = () => {
    if (!hasAnyQuotedPrice) {
      toast.error(t("modules.supplierPortal.quotation.detail.toastMissingItems"));
      return;
    }
    toast.success(t("modules.supplierPortal.quotation.detail.toastSent"));
  };

  const handleNoItems = () => {
    toast.message(t("modules.supplierPortal.quotation.detail.toastNoItems"));
  };

  if (!detail) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <Alert variant="destructive">
          <AlertTitle>{t("modules.supplierPortal.quotation.detail.notFoundTitle")}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>{t("modules.supplierPortal.quotation.detail.notFoundDescription")}</p>
            <Button asChild variant="outline" className="w-fit">
              <Link to="/supplier/quotations">{t("modules.supplierPortal.quotation.detail.backButton")}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout showPageHeader={false}>
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/supplier/quotations">{t("modules.supplierPortal.quotation.detail.breadcrumb")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono">#{detail.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <FileText className="size-6" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{detail.title}</h1>
                <Badge
                  variant="outline"
                  className="shrink-0 border-amber-200 bg-amber-50 font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
                >
                  {t(detailStatusLabelKey(detail.status))}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t("modules.supplierPortal.quotation.detail.instruction")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold leading-tight">
                {t("modules.supplierPortal.quotation.detail.restaurant.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border px-6 pb-5 pt-0 text-xs">
              <div className="flex flex-col gap-0.5 py-2.5 first:pt-0">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t("modules.supplierPortal.quotation.detail.restaurant.establishmentName")}
                </span>
                <span className="text-xs font-medium text-foreground">{detail.buyerName}</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t("modules.supplierPortal.quotation.detail.restaurant.representativeName")}
                </span>
                <span className="text-xs text-muted-foreground">{detail.buyerRepresentativeName}</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t("modules.supplierPortal.quotation.detail.restaurant.email")}
                </span>
                <span className="text-xs text-muted-foreground">{detail.buyerContactEmail}</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t("modules.supplierPortal.quotation.detail.restaurant.cnpj")}
                </span>
                <span className="text-xs text-muted-foreground">{detail.buyerTaxId}</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t("modules.supplierPortal.quotation.detail.restaurant.phone")}
                </span>
                <span className="text-xs text-muted-foreground">{detail.buyerPhone}</span>
              </div>
              <div className="flex flex-col gap-0.5 py-2.5 last:pb-0">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {t("modules.supplierPortal.quotation.detail.restaurant.address")}
                </span>
                <span className="text-xs text-muted-foreground leading-snug">{detail.buyerAddressLine}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("modules.supplierPortal.quotation.detail.stats.responseSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-0">
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="rounded-lg border bg-background px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Package className="size-4 shrink-0" aria-hidden />
                    <span>{t("modules.supplierPortal.quotation.detail.stats.boxItems")}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-lg font-semibold tabular-nums">{detail.items.length}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("modules.supplierPortal.quotation.detail.stats.itemsFilled", { count: filledItems })}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border bg-background px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Clock className="size-4 shrink-0" aria-hidden />
                    <span>{t("modules.supplierPortal.quotation.detail.stats.progress")}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-lg font-semibold tabular-nums">{completionPercent}%</span>
                    <span className="text-xs text-muted-foreground">
                      {t("modules.supplierPortal.quotation.detail.stats.progressOfQuote")}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border bg-background px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CalendarClock className="size-4 shrink-0" aria-hidden />
                    <span>{t("modules.supplierPortal.quotation.detail.stats.deadline")}</span>
                  </div>
                  <div className="mt-1.5">
                    <span className="text-lg font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                      {formatShortDateTime(detail.deadlineAt)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border bg-background px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Truck className="size-4 shrink-0" aria-hidden />
                    <span>{t("modules.supplierPortal.quotation.detail.stats.delivery")}</span>
                  </div>
                  <div className="mt-1.5">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {commercialTerms.delivery || detail.deliveryWindowLabel}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("modules.supplierPortal.quotation.detail.terms.title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="supplier-quote-payment-method">
                    {t("modules.supplierPortal.quotation.detail.terms.paymentMethod")}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="supplier-quote-payment-method"
                      value={commercialTerms.paymentMethod}
                      onChange={(e) =>
                        setCommercialTerms((prev) => ({ ...prev, paymentMethod: e.target.value }))
                      }
                    />
                  </FieldContent>
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="supplier-quote-payment-deadline">
                    {t("modules.supplierPortal.quotation.detail.terms.paymentDeadline")}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="supplier-quote-payment-deadline"
                      value={commercialTerms.paymentDeadline}
                      onChange={(e) =>
                        setCommercialTerms((prev) => ({ ...prev, paymentDeadline: e.target.value }))
                      }
                    />
                  </FieldContent>
                </Field>
              </div>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="supplier-quote-delivery">{t("modules.supplierPortal.quotation.detail.terms.delivery")}</FieldLabel>
                <FieldContent>
                  <Input
                    id="supplier-quote-delivery"
                    value={commercialTerms.delivery}
                    onChange={(e) => setCommercialTerms((prev) => ({ ...prev, delivery: e.target.value }))}
                  />
                </FieldContent>
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="supplier-quote-valid-until">
                  {t("modules.supplierPortal.quotation.detail.terms.quotationValidity")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="supplier-quote-valid-until"
                    type="date"
                    value={commercialTerms.quotationValidUntil}
                    onChange={(e) =>
                      setCommercialTerms((prev) => ({ ...prev, quotationValidUntil: e.target.value }))
                    }
                  />
                </FieldContent>
              </Field>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t("modules.supplierPortal.quotation.detail.items.title")}</CardTitle>
              <CardDescription>{t("modules.supplierPortal.quotation.detail.items.subtitle")}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="w-fit shrink-0 border-sky-300 bg-sky-50 font-medium text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
            >
              {t("modules.supplierPortal.quotation.detail.items.estimatedTotal", { total: estimatedTotalLabel })}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 px-0 pb-6 pt-0">
            <div className="overflow-x-auto px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">
                      {t("modules.supplierPortal.quotation.detail.items.colProduct")}
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      {t("modules.supplierPortal.quotation.detail.items.colSegments")}
                    </TableHead>
                    <TableHead className="w-24">{t("modules.supplierPortal.quotation.detail.items.colQty")}</TableHead>
                    <TableHead className="min-w-[130px]">
                      {t("modules.supplierPortal.quotation.detail.items.colPackaging")}
                    </TableHead>
                    <TableHead className="min-w-[180px]">
                      {t("modules.supplierPortal.quotation.detail.items.brandLabel")}
                    </TableHead>
                    <TableHead className="min-w-[130px]">
                      {t("modules.supplierPortal.quotation.detail.items.unitPriceLabel")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.items.flatMap((item) => {
                    const altsForItem = alternativeLines.filter((a) => a.parentItemId === item.id);
                    const lineKeys = getItemPriceLineKeys(item);
                    const isLastMainLine = (lineIdx: number) => lineIdx === lineKeys.length - 1;
                    const mainRows = lineKeys.map((lineKey, lineIdx) => {
                      const brandFixed = getFixedBrandLabelForLine(item, lineKey);
                      return (
                        <TableRow key={lineKey}>
                          <TableCell>
                            {lineIdx === 0 ? (
                              <span className="font-semibold">{item.productName}</span>
                            ) : (
                              <span className="pl-0.5 text-sm text-muted-foreground">↳</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lineIdx === 0 ? (
                              <SegmentBadges segments={item.segments} />
                            ) : null}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {lineIdx === 0 ? (
                              <>
                                {item.quantity} {item.unitLabel}
                              </>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {lineIdx === 0 ? item.requestedPackaging : null}
                          </TableCell>
                          <TableCell>
                            {brandFixed ? (
                              <Badge
                                className="max-w-[200px] truncate bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                                title={brandFixed}
                              >
                                {brandFixed}
                              </Badge>
                            ) : (
                              <Input
                                value={responses[lineKey]?.customBrand ?? ""}
                                onChange={(event) => handleCustomBrandChange(lineKey, event.target.value)}
                                placeholder={t("modules.supplierPortal.quotation.detail.items.noBrandFromBuyer")}
                                className="h-9 border-amber-500/70 bg-amber-50/40 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 dark:bg-amber-950/25"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-[200px] items-center gap-2">
                              <div className="flex h-9 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-input bg-background">
                                <span className="flex items-center border-r border-input bg-muted px-2 text-xs text-muted-foreground">
                                  R$
                                </span>
                                <Input
                                  value={responses[lineKey]?.unitPrice ?? ""}
                                  onChange={(event) => handleUnitPriceChange(lineKey, event.target.value)}
                                  placeholder="0,00"
                                  className="h-9 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                  inputMode="decimal"
                                />
                              </div>
                              {isLastMainLine(lineIdx) ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-9 shrink-0 gap-1.5"
                                  title={t("modules.supplierPortal.quotation.detail.items.addVariationLabel")}
                                  onClick={() => openVariationSheet(item.id)}
                                >
                                  <Plus className="size-4" aria-hidden />
                                  {t("modules.supplierPortal.quotation.detail.items.addVariationLabel")}
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    });
                    const altRows = altsForItem.map((alt) => (
                      <TableRow
                        key={alt.id}
                        className="bg-sky-50/60 dark:bg-sky-950/25"
                      >
                        <TableCell className="border-l-4 border-sky-600 pl-0 align-top">
                          <div className="pl-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                              {t("modules.supplierPortal.quotation.detail.items.alternativeBadge")}
                            </span>
                            <p className="mt-1 font-semibold text-foreground">{item.productName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <SegmentBadges segments={item.segments} />
                        </TableCell>
                        <TableCell className="tabular-nums text-foreground">
                          {item.quantity} {item.unitLabel}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.requestedPackaging}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">{alt.brand}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex h-9 min-w-[200px] items-center gap-2">
                            <div className="flex h-9 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-input bg-background">
                              <span className="flex items-center border-r border-input bg-muted px-2 text-xs text-muted-foreground">
                                R$
                              </span>
                              <Input
                                value={responses[alt.id]?.unitPrice ?? ""}
                                onChange={(event) => handleUnitPriceChange(alt.id, event.target.value)}
                                placeholder="0,00"
                                className="h-9 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                inputMode="decimal"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveVariation(alt.id)}
                              title="Remover alternativa"
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                    return [...mainRows, ...altRows];
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-2 px-6">
              <Field className="gap-2">
                <FieldLabel htmlFor="supplier-quote-general-notes">
                  {t("modules.supplierPortal.quotation.detail.items.generalNotesLabel")}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="supplier-quote-general-notes"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder={t("modules.supplierPortal.quotation.detail.items.generalNotesPlaceholder")}
                    rows={4}
                    className="min-h-[120px] resize-y"
                  />
                </FieldContent>
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 px-6">
              <Button asChild variant="ghost" className="text-muted-foreground">
                <Link to="/supplier/quotations">
                  <ArrowLeft data-icon="inline-start" />
                  {t("modules.supplierPortal.quotation.detail.cancelButton")}
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={handleNoItems}>
                {t("modules.supplierPortal.quotation.detail.noItemsButton")}
              </Button>
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                <Save data-icon="inline-start" />
                {t("modules.supplierPortal.quotation.detail.saveDraftButton")}
              </Button>
              <Button
                type="button"
                onClick={handleSendQuotation}
                className="bg-primary text-white hover:bg-primary/90 hover:text-white"
              >
                <Send data-icon="inline-start" />
                {t("modules.supplierPortal.quotation.detail.sendButton")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-sky-200 bg-sky-50/80 dark:border-sky-900 dark:bg-sky-950/30">
          <StickyNote className="size-4 shrink-0 text-sky-700 dark:text-sky-400" />
          <AlertTitle>{t("modules.supplierPortal.quotation.detail.tip.title")}</AlertTitle>
          <AlertDescription>{t("modules.supplierPortal.quotation.detail.tip.body")}</AlertDescription>
        </Alert>

        <Sheet open={variationSheetOpen} onOpenChange={handleVariationSheetOpenChange}>
          <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
            <SheetHeader className="pr-8 text-left">
              <SheetTitle>{t("modules.supplierPortal.quotation.detail.items.sheetTitle")}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-6">
              <Field className="gap-2">
                <FieldLabel htmlFor="variation-brand">
                  {t("modules.supplierPortal.quotation.detail.items.sheetBrand")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="variation-brand"
                    value={variationBrand}
                    onChange={(e) => setVariationBrand(e.target.value)}
                    placeholder={t("modules.supplierPortal.quotation.detail.items.brandPlaceholder")}
                  />
                </FieldContent>
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="variation-packaging-qty">
                  {t("modules.supplierPortal.quotation.detail.items.sheetPackagingQty")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="variation-packaging-qty"
                    value={variationPackagingQty}
                    onChange={(e) => setVariationPackagingQty(e.target.value)}
                    inputMode="decimal"
                  />
                </FieldContent>
              </Field>
              <Field className="gap-2">
                <FieldLabel>{t("modules.supplierPortal.quotation.detail.items.sheetPackagingUnit")}</FieldLabel>
                <FieldContent>
                  <Select
                    value={variationPackagingUnit}
                    onValueChange={(v) => setVariationPackagingUnit(v as PackagingUnit)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">
                        {t("modules.supplierPortal.quotation.detail.items.packagingUnitMl")}
                      </SelectItem>
                      <SelectItem value="l">
                        {t("modules.supplierPortal.quotation.detail.items.packagingUnitL")}
                      </SelectItem>
                      <SelectItem value="g">
                        {t("modules.supplierPortal.quotation.detail.items.packagingUnitG")}
                      </SelectItem>
                      <SelectItem value="kg">
                        {t("modules.supplierPortal.quotation.detail.items.packagingUnitKg")}
                      </SelectItem>
                      <SelectItem value="un">
                        {t("modules.supplierPortal.quotation.detail.items.packagingUnitUn")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </div>
            <SheetFooter className="flex flex-row gap-2 border-t border-border pt-6 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleVariationSheetOpenChange(false)}
              >
                {t("modules.supplierPortal.quotation.detail.items.sheetCancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSaveVariation}
                className="bg-primary text-white hover:bg-primary/90 hover:text-white"
              >
                {t("modules.supplierPortal.quotation.detail.items.sheetSave")}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardPageLayout>
  );
}
