import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  RefreshCw,
  Save,
  Send,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { SupplierQuotationItemObservationDialog } from "@/modules/supplier/quotation/components/SupplierQuotationItemObservationDialog";
import { SupplierQuotationVariationSheet } from "@/modules/supplier/quotation/components/SupplierQuotationVariationSheet";
import { useSupplierQuotationEditor } from "@/modules/supplier/quotation/hooks/useSupplierQuotationEditor";
import {
  getFixedBrandLabelForLine,
  getItemPriceLineKeys,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";
import type { TranslationKey } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { Field, FieldContent, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

const LIST_HREF = "/m/supplier/quotations";
const SEGMENT_BADGE_CLASS = "border-info/20 bg-info/10 text-info";

function formatShortDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MobileSupplierQuotationDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();

  const [variationSheetOpen, setVariationSheetOpen] = useState(false);
  const [variationParentId, setVariationParentId] = useState<string | null>(null);
  const [observationDialogOpen, setObservationDialogOpen] = useState(false);
  const [observationLineKey, setObservationLineKey] = useState<string | null>(null);
  const [establishmentOpen, setEstablishmentOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const editor = useSupplierQuotationEditor(id, {
    listPath: LIST_HREF,
    onValidationFailed: (field) => {
      if (field !== "items") setTermsOpen(true);
    },
  });

  if (editor.isLoading || !editor.detail) {
    return <p className="p-4 text-sm text-muted-foreground">Carregando…</p>;
  }

  const detail = editor.detail;
  const fieldErrorClass = "border-destructive ring-destructive/20";

  return (
    <div className="flex flex-col gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold leading-tight">{detail.buyerName}</h2>
        <p className="text-sm text-muted-foreground">{detail.buyerContactEmail}</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t("modules.supplierPortal.quotation.detail.instruction")}
      </p>

      <MobileCollapsibleCard
        titleKey="modules.supplierPortal.quotation.detail.restaurant.title"
        captionKey="modules.supplierPortal.quotation.mobile.establishmentInfoCaption"
        open={establishmentOpen}
        onOpenChange={setEstablishmentOpen}
      >
        <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.establishmentName")} value={detail.buyerName} />
        <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.representativeName")} value={detail.buyerRepresentativeName} />
        <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.email")} value={detail.buyerContactEmail} />
        <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.cnpj")} value={detail.buyerTaxId} />
        <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.phone")} value={detail.buyerPhone} />
        <InfoLine label={t("modules.supplierPortal.quotation.detail.restaurant.address")} value={detail.buyerAddressLine} last />
      </MobileCollapsibleCard>

      <MobileCollapsibleCard
        titleKey="modules.supplierPortal.quotation.mobile.deliveryInfoTitle"
        captionKey="modules.supplierPortal.quotation.mobile.deliveryInfoCaption"
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
      >
        <InfoLine label={t("modules.supplierPortal.quotation.mobile.deliveryTimeLabel")} value={detail.deliveryWindowLabel} />
        <InfoLine label={t("modules.supplierPortal.quotation.mobile.deadlineLabel")} value={formatShortDateTime(detail.deadlineAt)} last emphasize />
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
                data-validation-field="paymentMethod"
                value={editor.commercialTerms.paymentMethod}
                onChange={(e) => editor.setCommercialTerms((p) => ({ ...p, paymentMethod: e.target.value }))}
                className={editor.validationField === "paymentMethod" ? fieldErrorClass : undefined}
              />
            </FieldContent>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="m-paydd">{t("modules.supplierPortal.quotation.detail.terms.paymentDeadline")}</FieldLabel>
            <FieldContent>
              <Input
                id="m-paydd"
                data-validation-field="paymentDeadline"
                value={editor.commercialTerms.paymentDeadline}
                onChange={(e) => editor.setCommercialTerms((p) => ({ ...p, paymentDeadline: e.target.value }))}
                className={editor.validationField === "paymentDeadline" ? fieldErrorClass : undefined}
              />
            </FieldContent>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="m-deliv">{t("modules.supplierPortal.quotation.detail.terms.delivery")}</FieldLabel>
            <FieldContent>
              <Input
                id="m-deliv"
                data-validation-field="delivery"
                value={editor.commercialTerms.delivery}
                onChange={(e) => editor.setCommercialTerms((p) => ({ ...p, delivery: e.target.value }))}
                className={editor.validationField === "delivery" ? fieldErrorClass : undefined}
              />
            </FieldContent>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="m-val">{t("modules.supplierPortal.quotation.detail.terms.quotationValidity")}</FieldLabel>
            <FieldContent>
              <Input
                id="m-val"
                type="date"
                data-validation-field="quotationValidUntil"
                value={editor.commercialTerms.quotationValidUntil}
                onChange={(e) => editor.setCommercialTerms((p) => ({ ...p, quotationValidUntil: e.target.value }))}
                className={editor.validationField === "quotationValidUntil" ? fieldErrorClass : undefined}
              />
            </FieldContent>
          </Field>
        </div>
      </MobileCollapsibleCard>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => void editor.handleReusePricesOfDay()}>
          <RefreshCw className="size-4" />
          {t("modules.supplierPortal.quotation.mobile.reuseDayPrices")}
        </Button>
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border px-3 py-2">
          <Switch id="m-show-blocked" checked={editor.showBlocked} onCheckedChange={editor.setShowBlocked} />
          <label htmlFor="m-show-blocked" className="text-xs text-muted-foreground">
            {t("modules.supplierPortal.quotation.mobile.showBlocked")}
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2" data-validation-anchor="items">
        <h2 className="text-base font-semibold">{t("modules.supplierPortal.quotation.detail.items.title")}</h2>
        {editor.visibleItems.flatMap((item, itemIndex) => {
          const alts = editor.alternativeLines.filter((a) => a.parentItemId === item.id);
          const productRow = (
            <ItemCard
              key={item.id}
              displayIndex={itemIndex + 1}
              item={item}
              responses={editor.responses}
              onUnitPrice={editor.handleUnitPriceChange}
              onCustomBrand={editor.handleCustomBrandChange}
              onAddVariation={(parentId) => {
                setVariationParentId(parentId);
                setVariationSheetOpen(true);
              }}
              onToggleBlock={() => void editor.handleToggleBlock(item)}
              onOpenObservation={(lineKey) => {
                setObservationLineKey(lineKey);
                setObservationDialogOpen(true);
              }}
            />
          );
          const altRows = alts.map((alt) => (
            <Card key={alt.id} className="overflow-hidden border-l-4 border-info bg-info/10 shadow-sm">
              <CardContent className="p-3 pl-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-info">
                  {t("modules.supplierPortal.quotation.detail.items.alternativeBadge")}
                </p>
                <p className="mt-1 font-semibold">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {alt.brand} · {alt.packagingAmount} {alt.packagingUnit}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <MoneyInput
                    value={editor.responses[alt.id]?.unitPrice ?? ""}
                    onChange={(v) => editor.handleUnitPriceChange(alt.id, v)}
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => editor.removeAlternativeLine(alt.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setObservationLineKey(alt.id);
                      setObservationDialogOpen(true);
                    }}
                  >
                    <MessageSquarePlus className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ));
          return [productRow, ...altRows];
        })}
      </div>

      <Field className="gap-1.5">
        <FieldLabel htmlFor="m-notes">{t("modules.supplierPortal.quotation.detail.items.generalNotesLabel")}</FieldLabel>
        <FieldContent>
          <Textarea
            id="m-notes"
            value={editor.generalNotes}
            onChange={(e) => editor.setGeneralNotes(e.target.value)}
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

      <div className="mt-2 flex w-full flex-col gap-2 border-t border-border pt-4">
        <Button
          type="button"
          className="h-12 w-full gap-2"
          disabled={editor.sendMutation.isPending}
          onClick={() => void editor.handleSendQuotation()}
        >
          <Send className="size-4" />
          {t("modules.supplierPortal.quotation.detail.sendButton")}
        </Button>
        <Button type="button" variant="outline" className="h-12 w-full gap-2" onClick={editor.handleSaveDraft}>
          <Save className="size-4" />
          {t("modules.supplierPortal.quotation.detail.saveDraftButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full"
          disabled={editor.sendMutation.isPending}
          onClick={() => void editor.handleNoItems()}
        >
          {t("modules.supplierPortal.quotation.detail.noItemsButton")}
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full text-muted-foreground">
          <Link to={LIST_HREF}>
            <ArrowLeft className="size-4" />
            {t("modules.supplierPortal.quotation.detail.cancelButton")}
          </Link>
        </Button>
      </div>

      <SupplierQuotationVariationSheet
        open={variationSheetOpen}
        onOpenChange={setVariationSheetOpen}
        side="bottom"
        parentItemId={variationParentId}
        onSave={editor.addAlternativeLine}
      />

      <SupplierQuotationItemObservationDialog
        open={observationDialogOpen}
        onOpenChange={setObservationDialogOpen}
        lineKey={observationLineKey}
        initialValue={observationLineKey ? (editor.responses[observationLineKey]?.observation ?? "") : ""}
        onSave={editor.handleObservationChange}
      />
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
          <button type="button" className="flex w-full items-start justify-between gap-2 border-b border-border p-3 text-left">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold">{t(titleKey)}</span>
              <span className="text-xs text-muted-foreground">{t(captionKey)}</span>
            </div>
            {open ? <ChevronUp className="mt-0.5 size-5 shrink-0 text-muted-foreground" /> : <ChevronDown className="mt-0.5 size-5 shrink-0 text-muted-foreground" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col divide-y divide-border px-4 py-0 text-xs">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function InfoLine({ label, value, last, emphasize }: { label: string; value: string; last?: boolean; emphasize?: boolean }) {
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
  onToggleBlock,
  onOpenObservation,
}: {
  displayIndex: number;
  item: SupplierQuotationDetailItem;
  responses: Record<string, { unitPrice: string; customBrand?: string; observation?: string }>;
  onUnitPrice: (lineKey: string, v: string) => void;
  onCustomBrand: (lineKey: string, v: string) => void;
  onAddVariation: (id: string) => void;
  onToggleBlock: () => void;
  onOpenObservation: (lineKey: string) => void;
}) {
  const { t } = useI18n();
  const keys = getItemPriceLineKeys(item);

  return (
    <Card className={cn("shadow-sm", item.isBlocked && "opacity-60")}>
      <CardContent className="p-0">
        <p className="bg-muted/40 py-1.5 text-center text-sm font-bold tabular-nums">{displayIndex}</p>
        <div className="flex flex-col gap-3 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{item.productName}</span>
            <div className="flex items-center gap-2">
              <Checkbox checked={item.isBlocked} onCheckedChange={onToggleBlock} />
              <span className="text-xs text-muted-foreground">{t("modules.supplierPortal.quotation.mobile.block")}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {item.quantity} {item.unitLabel} · {item.requestedPackaging}
          </p>
          {item.establishmentObservation ? (
            <p className="text-xs text-muted-foreground">
              {t("modules.supplierPortal.quotation.mobile.establishmentNote")}: {item.establishmentObservation}
            </p>
          ) : null}
          <SegmentBadges segments={item.segments} />
          <div className="flex flex-col gap-3">
            {keys.map((lineKey) => {
              const brandFixed = getFixedBrandLabelForLine(item, lineKey);
              return (
                <div key={lineKey} className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0">
                  {brandFixed ? (
                    <Badge className="w-fit max-w-full truncate bg-primary font-medium text-primary-foreground">{brandFixed}</Badge>
                  ) : item.brandPlaceholder === "any" ? (
                    <Badge variant="outline" className="w-fit italic text-muted-foreground">
                      {t("modules.supplierPortal.quotation.detail.items.anyBrandPlaceholder")}
                    </Badge>
                  ) : item.brandPlaceholder === "none" ? (
                    <Badge variant="outline" className="w-fit italic text-destructive">
                      {t("modules.supplierPortal.quotation.detail.items.noBrandPlaceholder")}
                    </Badge>
                  ) : (
                    <Input
                      value={responses[lineKey]?.customBrand ?? ""}
                      onChange={(e) => onCustomBrand(lineKey, e.target.value)}
                      placeholder={t("modules.supplierPortal.quotation.detail.items.noBrandFromBuyer")}
                      className="h-10 border-amber-500/70 bg-warning/10/40"
                      disabled={item.isBlocked}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <MoneyInput
                      value={responses[lineKey]?.unitPrice ?? ""}
                      onChange={(v) => onUnitPrice(lineKey, v)}
                      disabled={item.isBlocked}
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => onOpenObservation(lineKey)} disabled={item.isBlocked}>
                      <MessageSquarePlus className={cn("size-4", responses[lineKey]?.observation?.trim() ? "text-primary" : "text-muted-foreground")} />
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button type="button" variant="outline" className="h-10 w-full" onClick={() => onAddVariation(item.id)} disabled={item.isBlocked}>
              {t("modules.supplierPortal.quotation.mobile.addAnotherBrand")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SegmentBadges({ segments }: { segments: string[] }) {
  const visible = segments.slice(0, 2);
  const hidden = segments.slice(2);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((segment, index) => (
        <Badge key={`${segment}-${index}`} variant="outline" className={cn("rounded-full text-xs font-medium", SEGMENT_BADGE_CLASS)}>
          {segment}
        </Badge>
      ))}
      {hidden.length > 0 ? (
        <TooltipProvider delayDuration={120}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-default rounded-full px-2">+{hidden.length}</Badge>
            </TooltipTrigger>
            <TooltipContent><p>{hidden.join(", ")}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex h-11 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-input bg-background">
      <span className="flex min-w-8 items-center border-r border-input bg-muted px-2 text-xs text-muted-foreground">R$</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0,00"
        className="h-11 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
        inputMode="decimal"
        disabled={disabled}
      />
    </div>
  );
}
