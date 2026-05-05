import { ArrowLeft, Save, Send, StickyNote, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { getSupplierQuotationDetail, type SupplierQuotationDetailItem } from "@/modules/supplier/quotation/data/supplierQuotationMocks";
import {
  createLineResponsesInitial,
  getFixedBrandLabelForLine,
  getItemPriceLineKeys,
  itemHasAnyPricedLine,
  parseMoneyBRL,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import type { TranslationKey } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
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
import { Textarea } from "@/shared/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { toast } from "@/shared/ui/sonner";

const SEGMENT_BADGE_CLASS = "border-sky-200 bg-sky-50 text-sky-800";
const OVERFLOW_BADGE_CLASS = "min-w-7 justify-center border-muted bg-muted/60 px-2 text-muted-foreground";

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

function formatShortDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((segment, index) => (
        <Badge
          key={`${segment}-${index}`}
          variant="outline"
          className={cn(
            "shrink-0 rounded-full text-xs font-medium",
            !shouldShowSingleBadge && "max-w-[120px] truncate",
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
              <span>
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
  return `modules.supplierPortal.quotation.list.status.${status}` as const;
}

const LIST_HREF = "/m/supplier/quotations";

export function MobileSupplierQuotationDetailPage() {
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
  const [establishmentOpen, setEstablishmentOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

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

  const handleUnitPriceChange = (itemId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        unitPrice: value,
      },
    }));
  };

  const handleCustomBrandChange = (itemId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
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

  const handleSaveVariation = () => {
    if (!variationParentId || !variationBrand.trim() || !variationPackagingQty.trim()) {
      toast.error(t("modules.supplierPortal.quotation.detail.items.sheetValidation"));
      return;
    }
    const newId = `alt-${variationParentId}-${crypto.randomUUID()}`;
    setAlternativeLines((prev) => [
      ...prev,
      {
        id: newId,
        parentItemId: variationParentId,
        brand: variationBrand.trim(),
        packagingAmount: variationPackagingQty.trim(),
        packagingUnit: variationPackagingUnit,
      },
    ]);
    setResponses((prev) => ({
      ...prev,
      [newId]: { unitPrice: "", customBrand: "" },
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

  const handleSaveDraft = () => {
    toast.success(t("modules.supplierPortal.quotation.detail.toastDraft"));
  };

  if (!detail) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertTitle>{t("modules.supplierPortal.quotation.detail.notFoundTitle")}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>{t("modules.supplierPortal.quotation.detail.notFoundDescription")}</p>
            <Button asChild variant="outline" className="w-fit">
              <Link to={LIST_HREF}>{t("modules.supplierPortal.quotation.detail.backButton")}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold leading-tight">{detail.buyerName}</h2>
        <p className="text-sm text-muted-foreground">{detail.buyerContactEmail}</p>
        <Badge
          variant="outline"
          className="w-fit border-amber-200 bg-amber-50 font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40"
        >
          {t(detailStatusLabelKey(detail.status))}
        </Badge>
      </div>

      <div className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
        <span>{t("modules.supplierPortal.quotation.detail.instruction")}</span>
      </div>

      <MobileCollapsibleCard
        titleKey="modules.supplierPortal.quotation.detail.restaurant.title"
        captionKey="modules.supplierPortal.quotation.mobile.establishmentInfoCaption"
        open={establishmentOpen}
        onOpenChange={setEstablishmentOpen}
      >
        <div className="flex flex-col divide-y divide-border px-4 py-0 text-xs">
          <InfoLine
            label={t("modules.supplierPortal.quotation.detail.restaurant.establishmentName")}
            value={detail.buyerName}
          />
          <InfoLine
            label={t("modules.supplierPortal.quotation.detail.restaurant.representativeName")}
            value={detail.buyerRepresentativeName}
          />
          <InfoLine
            label={t("modules.supplierPortal.quotation.detail.restaurant.email")}
            value={detail.buyerContactEmail}
          />
          <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.cnpj")} value={detail.buyerTaxId} />
          <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.phone")} value={detail.buyerPhone} />
          <InfoLine
            label={t("modules.supplierPortal.quotation.detail.restaurant.address")}
            value={detail.buyerAddressLine}
            last
          />
        </div>
      </MobileCollapsibleCard>

      <MobileCollapsibleCard
        titleKey="modules.supplierPortal.quotation.mobile.deliveryInfoTitle"
        captionKey="modules.supplierPortal.quotation.mobile.deliveryInfoCaption"
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
      >
        <div className="flex flex-col gap-0 divide-y divide-border px-4 py-0 text-xs">
          <InfoLine
            label={t("modules.supplierPortal.quotation.mobile.deliveryTimeLabel")}
            value={detail.deliveryWindowLabel}
          />
          <InfoLine
            label={t("modules.supplierPortal.quotation.mobile.deadlineLabel")}
            value={formatShortDateTime(detail.deadlineAt)}
            last
            emphasize
          />
        </div>
      </MobileCollapsibleCard>

      <MobileCollapsibleCard
        titleKey="modules.supplierPortal.quotation.detail.terms.title"
        captionKey="modules.supplierPortal.quotation.mobile.termsInfoCaption"
        open={termsOpen}
        onOpenChange={setTermsOpen}
      >
        <div className="flex flex-col gap-3 px-4 py-3">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="m-payment">{t("modules.supplierPortal.quotation.detail.terms.paymentMethod")}</FieldLabel>
            <FieldContent>
              <Input
                id="m-payment"
                value={commercialTerms.paymentMethod}
                onChange={(e) =>
                  setCommercialTerms((p) => ({ ...p, paymentMethod: e.target.value }))
                }
              />
            </FieldContent>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="m-paydd">{t("modules.supplierPortal.quotation.detail.terms.paymentDeadline")}</FieldLabel>
            <FieldContent>
              <Input
                id="m-paydd"
                value={commercialTerms.paymentDeadline}
                onChange={(e) =>
                  setCommercialTerms((p) => ({ ...p, paymentDeadline: e.target.value }))
                }
              />
            </FieldContent>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="m-deliv">{t("modules.supplierPortal.quotation.detail.terms.delivery")}</FieldLabel>
            <FieldContent>
              <Input
                id="m-deliv"
                value={commercialTerms.delivery}
                onChange={(e) => setCommercialTerms((p) => ({ ...p, delivery: e.target.value }))}
              />
            </FieldContent>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="m-val">{t("modules.supplierPortal.quotation.detail.terms.quotationValidity")}</FieldLabel>
            <FieldContent>
              <Input
                id="m-val"
                type="date"
                value={commercialTerms.quotationValidUntil}
                onChange={(e) =>
                  setCommercialTerms((p) => ({ ...p, quotationValidUntil: e.target.value }))
                }
              />
            </FieldContent>
          </Field>
        </div>
      </MobileCollapsibleCard>

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">
          {t("modules.supplierPortal.quotation.detail.items.title")}
        </h2>
        {detail.items.flatMap((item, itemIndex) => {
          const alts = alternativeLines.filter((a) => a.parentItemId === item.id);
          const productRow = (
            <ItemCard
              key={item.id}
              displayIndex={itemIndex + 1}
              item={item}
              responses={responses}
              onUnitPrice={handleUnitPriceChange}
              onCustomBrand={handleCustomBrandChange}
              onAddVariation={openVariationSheet}
            />
          );
          const altRows = alts.map((alt) => {
            const altPack = formatPackagingDisplay(alt.packagingAmount, alt.packagingUnit);
            const showAltPack = altPack.toLowerCase() !== item.requestedPackaging.toLowerCase();
            return (
              <Card
                key={alt.id}
                className="overflow-hidden border-l-4 border-sky-600 bg-sky-50/50 shadow-sm dark:bg-sky-950/20"
              >
                <CardContent className="p-3 pl-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    {t("modules.supplierPortal.quotation.detail.items.alternativeBadge")}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {item.unitLabel} · {item.requestedPackaging}
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      {t("modules.supplierPortal.quotation.detail.items.colSegments")}
                    </p>
                    <div className="mt-1">
                      <SegmentBadges segments={item.segments} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("modules.supplierPortal.quotation.detail.items.brandLabel")}
                  </p>
                  <p className="text-sm font-medium text-foreground">{alt.brand}</p>
                  {showAltPack ? (
                    <p className="text-xs text-muted-foreground">
                      {altPack}
                    </p>
                  ) : null}
                  <div className="mt-2 flex min-h-11 items-stretch gap-2">
                    <div className="flex min-h-11 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-input bg-background">
                      <span className="flex min-w-8 items-center border-r border-input bg-muted px-2 text-xs text-muted-foreground">
                        R$
                      </span>
                      <Input
                        value={responses[alt.id]?.unitPrice ?? ""}
                        onChange={(e) => handleUnitPriceChange(alt.id, e.target.value)}
                        placeholder="0,00"
                        className="h-11 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
                        inputMode="decimal"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveVariation(alt.id)}
                      className="shrink-0"
                      aria-label="Remover"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          });
          return [productRow, ...altRows];
        })}
      </div>

      <Field className="gap-1.5">
        <FieldLabel htmlFor="m-notes">{t("modules.supplierPortal.quotation.detail.items.generalNotesLabel")}</FieldLabel>
        <FieldContent>
          <Textarea
            id="m-notes"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            rows={3}
            placeholder={t("modules.supplierPortal.quotation.detail.items.generalNotesPlaceholder")}
            className="min-h-[88px] resize-y"
          />
        </FieldContent>
      </Field>

      <Alert>
        <StickyNote className="size-4 shrink-0" />
        <AlertTitle>{t("modules.supplierPortal.quotation.detail.tip.title")}</AlertTitle>
        <AlertDescription>{t("modules.supplierPortal.quotation.detail.tip.body")}</AlertDescription>
      </Alert>

      <Sheet
        open={variationSheetOpen}
        onOpenChange={(open) => {
          setVariationSheetOpen(open);
          if (!open) setVariationParentId(null);
        }}
      >
        <SheetContent side="bottom" className="max-h-[90vh] rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle>{t("modules.supplierPortal.quotation.detail.items.sheetTitle")}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 py-2">
            <Field className="gap-2">
              <FieldLabel htmlFor="m-var-b">{t("modules.supplierPortal.quotation.detail.items.sheetBrand")}</FieldLabel>
              <FieldContent>
                <Input
                  id="m-var-b"
                  value={variationBrand}
                  onChange={(e) => setVariationBrand(e.target.value)}
                  placeholder={t("modules.supplierPortal.quotation.detail.items.brandPlaceholder")}
                />
              </FieldContent>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="m-var-qty">{t("modules.supplierPortal.quotation.detail.items.sheetPackagingQty")}</FieldLabel>
              <FieldContent>
                <Input
                  id="m-var-qty"
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">{t("modules.supplierPortal.quotation.detail.items.packagingUnitMl")}</SelectItem>
                    <SelectItem value="l">{t("modules.supplierPortal.quotation.detail.items.packagingUnitL")}</SelectItem>
                    <SelectItem value="g">{t("modules.supplierPortal.quotation.detail.items.packagingUnitG")}</SelectItem>
                    <SelectItem value="kg">{t("modules.supplierPortal.quotation.detail.items.packagingUnitKg")}</SelectItem>
                    <SelectItem value="un">{t("modules.supplierPortal.quotation.detail.items.packagingUnitUn")}</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </div>
          <SheetFooter className="flex flex-row gap-2 border-t border-border pt-6 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setVariationSheetOpen(false)}>
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

      <div className="mt-2 flex w-full flex-col gap-2 border-t border-border pt-4">
        <Button
          type="button"
          className="h-12 w-full gap-2 bg-primary text-white hover:bg-primary/90 hover:text-white"
          onClick={handleSendQuotation}
        >
          <Send className="size-4" aria-hidden />
          {t("modules.supplierPortal.quotation.detail.sendButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-2"
          onClick={handleSaveDraft}
        >
          <Save className="size-4" aria-hidden />
          {t("modules.supplierPortal.quotation.detail.saveDraftButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full"
          onClick={handleNoItems}
        >
          {t("modules.supplierPortal.quotation.detail.noItemsButton")}
        </Button>
        <Button
          asChild
          type="button"
          variant="ghost"
          className="h-11 w-full text-muted-foreground"
        >
          <Link to={LIST_HREF}>
            <ArrowLeft className="size-4" aria-hidden />
            {t("modules.supplierPortal.quotation.detail.cancelButton")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function MobileCollapsibleCard({
  titleKey,
  captionKey,
  open,
  onOpenChange,
  children,
}: {
  titleKey: TranslationKey;
  captionKey: TranslationKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-2 border-b border-border p-3 text-left"
          >
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{t(titleKey)}</span>
              <span className="text-xs text-muted-foreground">{t(captionKey)}</span>
            </div>
            {open ? (
              <ChevronUp className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function InfoLine({
  label,
  value,
  last,
  emphasize,
}: {
  label: string;
  value: string;
  last?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 py-2.5", last && "last:pb-0")}>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className={cn("text-sm", emphasize && "font-medium text-foreground")}>{value}</span>
    </div>
  );
}

function ItemCard({
  displayIndex,
  item,
  responses,
  onUnitPrice,
  onCustomBrand,
  onAddVariation,
}: {
  displayIndex: number;
  item: SupplierQuotationDetailItem;
  responses: ItemResponseState;
  onUnitPrice: (lineKey: string, v: string) => void;
  onCustomBrand: (lineKey: string, v: string) => void;
  onAddVariation: (id: string) => void;
}) {
  const { t } = useI18n();
  const lineKeys = getItemPriceLineKeys(item);
  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <p className="bg-muted/40 py-1.5 text-center text-sm font-bold tabular-nums">
          {displayIndex}
        </p>
        <div className="flex flex-col gap-3 p-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("modules.supplierPortal.quotation.detail.items.colProduct")}
            </p>
            <p className="text-sm font-semibold">
              {item.productName} — {item.quantity} {item.unitLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.requestedPackaging}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("modules.supplierPortal.quotation.detail.items.colSegments")}
            </p>
            <div className="mt-1">
              <SegmentBadges segments={item.segments} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("modules.supplierPortal.quotation.mobile.establishmentNote")}
            </p>
            <p className="text-sm">—</p>
          </div>
          <div className="flex flex-col gap-3">
            {lineKeys.map((lineKey) => {
              const brandFixed = getFixedBrandLabelForLine(item, lineKey);
              return (
                <div
                  key={lineKey}
                  className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0"
                >
                  {brandFixed ? (
                    <div className="inline-flex w-fit max-w-full">
                      <Badge
                        className="max-w-full truncate bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                        title={brandFixed}
                      >
                        {brandFixed}
                      </Badge>
                    </div>
                  ) : (
                    <Input
                      value={responses[lineKey]?.customBrand ?? ""}
                      onChange={(e) => onCustomBrand(lineKey, e.target.value)}
                      placeholder={t("modules.supplierPortal.quotation.detail.items.noBrandFromBuyer")}
                      className="h-10 border-amber-500/70 bg-amber-50/40"
                    />
                  )}
                  <div className="flex min-h-[44px] items-stretch">
                    <div className="flex h-11 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-input bg-background">
                      <span className="flex min-w-8 items-center border-r border-input bg-muted px-2 text-xs text-muted-foreground">
                        R$
                      </span>
                      <Input
                        value={responses[lineKey]?.unitPrice ?? ""}
                        onChange={(e) => onUnitPrice(lineKey, e.target.value)}
                        placeholder="0,00"
                        className="h-11 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
                        inputMode="decimal"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-center text-sm font-medium"
              onClick={() => onAddVariation(item.id)}
            >
              {t("modules.supplierPortal.quotation.mobile.addAnotherBrand")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
