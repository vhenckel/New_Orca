import {
  ArrowLeft,
  CalendarClock,
  Clock,
  FileText,
  MessageSquarePlus,
  Package,
  Plus,
  RefreshCw,
  Save,
  Send,
  StickyNote,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { SupplierQuotationItemObservationDialog } from "@/modules/supplier/quotation/components/SupplierQuotationItemObservationDialog";
import { SupplierQuotationVariationSheet } from "@/modules/supplier/quotation/components/SupplierQuotationVariationSheet";
import { useSupplierQuotationEditor } from "@/modules/supplier/quotation/hooks/useSupplierQuotationEditor";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Field, FieldContent, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
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

const SEGMENT_BADGE_CLASS = "border-info/20 bg-info/10 text-info";
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

function BrandPlaceholderBadge({ item }: { item: SupplierQuotationDetailItem }) {
  const { t } = useI18n();
  if (!item.brandPlaceholder) return null;
  const isAny = item.brandPlaceholder === "any";
  return (
    <Badge
      variant="outline"
      className={cn(
        "italic",
        isAny
          ? "border-muted-foreground/30 bg-muted/40 text-muted-foreground"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {isAny
        ? t("modules.supplierPortal.quotation.detail.items.anyBrandPlaceholder")
        : t("modules.supplierPortal.quotation.detail.items.noBrandPlaceholder")}
    </Badge>
  );
}

export function SupplierQuotationDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const editor = useSupplierQuotationEditor(id);

  const [variationSheetOpen, setVariationSheetOpen] = useState(false);
  const [variationParentId, setVariationParentId] = useState<string | null>(null);
  const [observationDialogOpen, setObservationDialogOpen] = useState(false);
  const [observationLineKey, setObservationLineKey] = useState<string | null>(null);

  const openVariationSheet = (parentItemId: string) => {
    setVariationParentId(parentItemId);
    setVariationSheetOpen(true);
  };

  const openObservationDialog = (lineKey: string) => {
    setObservationLineKey(lineKey);
    setObservationDialogOpen(true);
  };

  if (editor.isLoading || !editor.detail) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </DashboardPageLayout>
    );
  }

  const detail = editor.detail;
  const fieldErrorClass = "border-destructive ring-destructive/20";

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
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
              <FileText className="size-6" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{detail.title}</h1>
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
              <InfoRow label={t("modules.supplierPortal.quotation.detail.restaurant.establishmentName")} value={detail.buyerName} />
              <InfoRow label={t("modules.supplierPortal.quotation.detail.restaurant.representativeName")} value={detail.buyerRepresentativeName} />
              <InfoRow label={t("modules.supplierPortal.quotation.detail.restaurant.email")} value={detail.buyerContactEmail} />
              <InfoRow label={t("modules.supplierPortal.quotation.detail.restaurant.cnpj")} value={detail.buyerTaxId} />
              <InfoRow label={t("modules.supplierPortal.quotation.detail.restaurant.phone")} value={detail.buyerPhone} />
              <InfoRow label={t("modules.supplierPortal.quotation.detail.restaurant.address")} value={detail.buyerAddressLine} last />
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
                <StatBox icon={Package} label={t("modules.supplierPortal.quotation.detail.stats.boxItems")}>
                  <span className="text-lg font-semibold tabular-nums">{editor.mergedItems.length}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("modules.supplierPortal.quotation.detail.stats.itemsFilled", { count: editor.filledItems })}
                  </span>
                </StatBox>
                <StatBox icon={Clock} label={t("modules.supplierPortal.quotation.detail.stats.progress")}>
                  <span className="text-lg font-semibold tabular-nums">{editor.completionPercent}%</span>
                  <span className="text-xs text-muted-foreground">
                    {t("modules.supplierPortal.quotation.detail.stats.progressOfQuote")}
                  </span>
                </StatBox>
                <StatBox icon={CalendarClock} label={t("modules.supplierPortal.quotation.detail.stats.deadline")}>
                  <span className="text-lg font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                    {formatShortDateTime(detail.deadlineAt)}
                  </span>
                </StatBox>
                <StatBox icon={Truck} label={t("modules.supplierPortal.quotation.detail.stats.delivery")}>
                  <span className="block truncate text-sm font-medium text-foreground">
                    {editor.commercialTerms.delivery || detail.deliveryWindowLabel}
                  </span>
                </StatBox>
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
                      value={editor.commercialTerms.paymentMethod}
                      onChange={(e) =>
                        editor.setCommercialTerms((prev) => ({ ...prev, paymentMethod: e.target.value }))
                      }
                      className={editor.validationField === "paymentMethod" ? fieldErrorClass : undefined}
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
                      value={editor.commercialTerms.paymentDeadline}
                      onChange={(e) =>
                        editor.setCommercialTerms((prev) => ({ ...prev, paymentDeadline: e.target.value }))
                      }
                      className={editor.validationField === "paymentDeadline" ? fieldErrorClass : undefined}
                    />
                  </FieldContent>
                </Field>
              </div>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="supplier-quote-delivery">{t("modules.supplierPortal.quotation.detail.terms.delivery")}</FieldLabel>
                <FieldContent>
                  <Input
                    id="supplier-quote-delivery"
                    value={editor.commercialTerms.delivery}
                    onChange={(e) => editor.setCommercialTerms((prev) => ({ ...prev, delivery: e.target.value }))}
                    className={editor.validationField === "delivery" ? fieldErrorClass : undefined}
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
                    value={editor.commercialTerms.quotationValidUntil}
                    onChange={(e) =>
                      editor.setCommercialTerms((prev) => ({ ...prev, quotationValidUntil: e.target.value }))
                    }
                    className={editor.validationField === "quotationValidUntil" ? fieldErrorClass : undefined}
                  />
                </FieldContent>
              </Field>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle>{t("modules.supplierPortal.quotation.detail.items.title")}</CardTitle>
                <CardDescription>{t("modules.supplierPortal.quotation.detail.items.subtitle")}</CardDescription>
              </div>
              <Badge
                variant="outline"
                className="w-fit shrink-0 border-info/30 bg-info/10 font-medium text-info"
              >
                {t("modules.supplierPortal.quotation.detail.items.estimatedTotal", {
                  total: editor.estimatedTotalLabel,
                })}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => void editor.handleReusePricesOfDay()}>
                <RefreshCw data-icon="inline-start" />
                {t("modules.supplierPortal.quotation.detail.items.reuseDayPrices")}
              </Button>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-blocked-products"
                  checked={editor.showBlocked}
                  onCheckedChange={editor.setShowBlocked}
                />
                <label htmlFor="show-blocked-products" className="text-sm text-muted-foreground">
                  {t("modules.supplierPortal.quotation.detail.items.showBlocked")}
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 px-0 pb-6 pt-0">
            <div
              className={cn("overflow-x-auto px-6", editor.validationField === "items" && "rounded-md ring-2 ring-destructive/40")}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">{t("modules.supplierPortal.quotation.detail.items.colBlock")}</TableHead>
                    <TableHead className="min-w-[180px]">{t("modules.supplierPortal.quotation.detail.items.colProduct")}</TableHead>
                    <TableHead className="min-w-[120px]">{t("modules.supplierPortal.quotation.detail.items.colSegments")}</TableHead>
                    <TableHead className="w-24">{t("modules.supplierPortal.quotation.detail.items.colQty")}</TableHead>
                    <TableHead className="min-w-[120px]">{t("modules.supplierPortal.quotation.detail.items.colPackaging")}</TableHead>
                    <TableHead className="min-w-[140px]">{t("modules.supplierPortal.quotation.detail.items.colEstablishmentNote")}</TableHead>
                    <TableHead className="min-w-[160px]">{t("modules.supplierPortal.quotation.detail.items.brandLabel")}</TableHead>
                    <TableHead className="min-w-[120px]">{t("modules.supplierPortal.quotation.detail.items.unitPriceLabel")}</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editor.visibleItems.flatMap((item) => {
                    const altsForItem = editor.alternativeLines.filter((a) => a.parentItemId === item.id);
                    const lineKeys = editor.getItemPriceLineKeys(item);
                    const groupRowCount = lineKeys.length + altsForItem.length;

                    const mainRows = lineKeys.map((lineKey, lineIdx) => {
                      const brandFixed = editor.getFixedBrandLabelForLine(item, lineKey);
                      const shouldRenderGroupCells = lineIdx === 0;
                      const isLastMainLine = lineIdx === lineKeys.length - 1;

                      return (
                        <TableRow key={lineKey} className={item.isBlocked ? "opacity-60" : undefined}>
                          {shouldRenderGroupCells ? (
                            <TableCell rowSpan={groupRowCount} className="align-middle">
                              <Checkbox
                                checked={item.isBlocked}
                                onCheckedChange={() => void editor.handleToggleBlock(item)}
                                aria-label={t("modules.supplierPortal.quotation.detail.items.blockLabel")}
                              />
                            </TableCell>
                          ) : null}
                          {shouldRenderGroupCells ? (
                            <>
                              <TableCell rowSpan={groupRowCount} className="align-middle">
                                <span className="font-semibold">{item.productName}</span>
                              </TableCell>
                              <TableCell rowSpan={groupRowCount} className="align-middle">
                                <SegmentBadges segments={item.segments} />
                              </TableCell>
                              <TableCell rowSpan={groupRowCount} className="align-middle tabular-nums">
                                {item.quantity} {item.unitLabel}
                              </TableCell>
                              <TableCell rowSpan={groupRowCount} className="align-middle text-sm text-muted-foreground">
                                {item.requestedPackaging}
                              </TableCell>
                              <TableCell rowSpan={groupRowCount} className="align-middle text-sm text-muted-foreground">
                                {item.establishmentObservation || "—"}
                              </TableCell>
                            </>
                          ) : null}
                          <TableCell>
                            {brandFixed ? (
                              <Badge className="max-w-[200px] truncate bg-primary font-medium text-primary-foreground">
                                {brandFixed}
                              </Badge>
                            ) : item.brandPlaceholder ? (
                              <BrandPlaceholderBadge item={item} />
                            ) : (
                              <Input
                                value={editor.responses[lineKey]?.customBrand ?? ""}
                                onChange={(e) => editor.handleCustomBrandChange(lineKey, e.target.value)}
                                placeholder={t("modules.supplierPortal.quotation.detail.items.noBrandFromBuyer")}
                                className="h-9 border-amber-500/70 bg-warning/10/40"
                                disabled={item.isBlocked}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-[180px] items-center gap-2">
                              <MoneyInput
                                value={editor.responses[lineKey]?.unitPrice ?? ""}
                                onChange={(v) => editor.handleUnitPriceChange(lineKey, v)}
                                disabled={item.isBlocked}
                              />
                              {isLastMainLine ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openVariationSheet(item.id)}
                                  disabled={item.isBlocked}
                                >
                                  <Plus className="size-4" />
                                  {t("modules.supplierPortal.quotation.detail.items.addVariationLabel")}
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openObservationDialog(lineKey)}
                              disabled={item.isBlocked}
                              title={t("modules.supplierPortal.quotation.detail.items.addObservation")}
                            >
                              <MessageSquarePlus
                                className={cn(
                                  "size-4",
                                  editor.responses[lineKey]?.observation?.trim()
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    });

                    const altRows = altsForItem.map((alt) => (
                      <TableRow key={alt.id} className="bg-info/10">
                        <TableCell className="border-l-4 border-info">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-info/30 bg-info/10 font-semibold text-info">
                              {t("modules.supplierPortal.quotation.detail.items.alternativeBadge")}
                            </Badge>
                            <span className="truncate text-sm font-medium">{alt.brand}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MoneyInput
                              value={editor.responses[alt.id]?.unitPrice ?? ""}
                              onChange={(v) => editor.handleUnitPriceChange(alt.id, v)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => editor.removeAlternativeLine(alt.id)}
                            >
                              <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openObservationDialog(alt.id)}
                          >
                            <MessageSquarePlus className="size-4 text-muted-foreground" />
                          </Button>
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
                    value={editor.generalNotes}
                    onChange={(e) => editor.setGeneralNotes(e.target.value)}
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
              <Button
                type="button"
                variant="outline"
                disabled={editor.sendMutation.isPending}
                onClick={() => void editor.handleNoItems()}
              >
                {t("modules.supplierPortal.quotation.detail.noItemsButton")}
              </Button>
              <Button type="button" variant="outline" onClick={editor.handleSaveDraft}>
                <Save data-icon="inline-start" />
                {t("modules.supplierPortal.quotation.detail.saveDraftButton")}
              </Button>
              <Button
                type="button"
                disabled={editor.sendMutation.isPending}
                onClick={() => void editor.handleSendQuotation()}
                className="bg-primary text-white hover:bg-primary/90 hover:text-white"
              >
                <Send data-icon="inline-start" />
                {t("modules.supplierPortal.quotation.detail.sendButton")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-info/20 bg-info/10">
          <StickyNote className="size-4 shrink-0 text-info" />
          <AlertTitle>{t("modules.supplierPortal.quotation.detail.tip.title")}</AlertTitle>
          <AlertDescription>{t("modules.supplierPortal.quotation.detail.tip.body")}</AlertDescription>
        </Alert>

        <SupplierQuotationVariationSheet
          open={variationSheetOpen}
          onOpenChange={setVariationSheetOpen}
          parentItemId={variationParentId}
          onSave={editor.addAlternativeLine}
        />

        <SupplierQuotationItemObservationDialog
          open={observationDialogOpen}
          onOpenChange={setObservationDialogOpen}
          lineKey={observationLineKey}
          initialValue={
            observationLineKey ? (editor.responses[observationLineKey]?.observation ?? "") : ""
          }
          onSave={editor.handleObservationChange}
        />
      </div>
    </DashboardPageLayout>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5 py-2.5", last ? "last:pb-0" : "first:pt-0")}>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Package;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        <span>{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">{children}</div>
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
    <div className="flex h-9 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-input bg-background">
      <span className="flex items-center border-r border-input bg-muted px-2 text-xs text-muted-foreground">R$</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0,00"
        className="h-9 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
        inputMode="decimal"
        disabled={disabled}
      />
    </div>
  );
}
