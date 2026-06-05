import { useCallback, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useBudgetOrder } from "@/modules/buyer/quotation/hooks/useBudgetOrder";
import { generateOrderPdf } from "@/modules/buyer/quotation/lib/generate-order-pdf";
import { formatViewBudgetDateTime } from "@/modules/buyer/quotation/lib/view-budget-display";
import type { BudgetViewProduct } from "@/modules/buyer/quotation/types/view-budget";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "@/shared/ui/sonner";

const ALL_SUPPLIERS_VALUE = "all";

type ViewBudgetGenerateOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string;
  products: BudgetViewProduct[];
  buyerName?: string;
  deliveryTime?: string;
  deadlineIso?: string;
  budgetObservation?: string;
};

export function ViewBudgetGenerateOrderDialog({
  open,
  onOpenChange,
  budgetId,
  products,
  buyerName,
  deliveryTime,
  deadlineIso,
  budgetObservation,
}: ViewBudgetGenerateOrderDialogProps) {
  const { t } = useI18n();

  const formatLabels = useMemo(
    () => ({
      noSupplierHeader: t("modules.quotation.detail.generateOrderDialog.noSupplierHeader"),
      paymentNotInformed: t("modules.quotation.detail.generateOrderDialog.paymentNotInformed"),
      observationNotInformed: t("modules.quotation.detail.generateOrderDialog.observationNotInformed"),
    }),
    [t],
  );

  const pdfLabels = useMemo(
    () => ({
      documentTitle: t("modules.quotation.detail.generateOrderDialog.pdfTitle"),
      documentSubtitle: t("modules.quotation.detail.generateOrderDialog.pdfSubtitle"),
      orderNumber: t("modules.quotation.detail.generateOrderDialog.orderNumberLabel"),
      generationDate: t("modules.quotation.detail.generateOrderDialog.generationDate"),
      status: t("modules.quotation.detail.generateOrderDialog.status"),
      statusPending: t("modules.quotation.detail.generateOrderDialog.statusPending"),
      statusConfirmed: t("modules.quotation.detail.generateOrderDialog.statusConfirmed"),
      buyerTitle: t("modules.quotation.detail.generateOrderDialog.buyerTitle"),
      deliveryTitle: t("modules.quotation.detail.generateOrderDialog.deliveryTitle"),
      supplierTitle: t("modules.quotation.detail.generateOrderDialog.supplierTitle"),
      responsible: t("modules.quotation.detail.generateOrderDialog.responsible"),
      phone: t("modules.quotation.detail.generateOrderDialog.phone"),
      email: t("modules.quotation.detail.generateOrderDialog.email"),
      document: t("modules.quotation.detail.generateOrderDialog.document"),
      deliveryTimeLabel: t("modules.quotation.detail.generateOrderDialog.deliveryTimeLabel"),
      deadlineLabel: t("modules.quotation.detail.generateOrderDialog.deadlineLabel"),
      notInformed: t("modules.quotation.detail.generateOrderDialog.notInformed"),
      supplierNotSelected: t("modules.quotation.detail.generateOrderDialog.supplierNotSelected"),
      supplierNotSelectedHint: t("modules.quotation.detail.generateOrderDialog.supplierNotSelectedHint"),
      warningTitle: t("modules.quotation.detail.generateOrderDialog.warningTitle"),
      warningSubtitle: t("modules.quotation.detail.generateOrderDialog.warningSubtitle"),
      totalLabel: t("modules.quotation.detail.generateOrderDialog.totalLabel"),
      observationsTitle: t("modules.quotation.detail.generateOrderDialog.observationsTitle"),
      noSupplierObservation: t("modules.quotation.detail.generateOrderDialog.noSupplierObservation"),
      paymentLabel: t("modules.quotation.detail.generateOrderDialog.payment"),
      footerBrand: t("modules.quotation.detail.generateOrderDialog.footerBrand"),
      footerTagline: t("modules.quotation.detail.generateOrderDialog.footerTagline"),
      footerUrl: t("modules.quotation.detail.generateOrderDialog.footerUrl"),
      page: t("modules.quotation.detail.generateOrderDialog.page"),
      pageOf: t("modules.quotation.detail.generateOrderDialog.pageOf"),
      generatedPrefix: t("modules.quotation.detail.generateOrderDialog.generatedPrefix"),
      emptyValue: "—",
      columns: {
        qty: t("modules.quotation.detail.generateOrderDialog.columns.qty"),
        unit: t("modules.quotation.detail.generateOrderDialog.columns.unit"),
        product: t("modules.quotation.detail.generateOrderDialog.columns.product"),
        brands: t("modules.quotation.detail.generateOrderDialog.columns.brands"),
        observation: t("modules.quotation.detail.generateOrderDialog.columns.observation"),
        unitPrice: t("modules.quotation.detail.generateOrderDialog.columns.unitPrice"),
        total: t("modules.quotation.detail.generateOrderDialog.columns.total"),
      },
    }),
    [t],
  );

  const pdfMeta = useMemo(
    () => ({
      orderNumber: `#${budgetId.slice(0, 8)}`,
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      buyerName: buyerName?.trim() || "",
      deliveryTime: deliveryTime?.trim() || undefined,
      deadline: deadlineIso ? formatViewBudgetDateTime(deadlineIso) : undefined,
      budgetObservation: budgetObservation?.trim() || undefined,
    }),
    [budgetId, buyerName, deliveryTime, deadlineIso, budgetObservation],
  );

  const {
    supplierId,
    setSupplierId,
    resolvedOrders,
    orderText,
    supplierOptions,
    isLoading,
    isError,
  } = useBudgetOrder(
    budgetId,
    products,
    open,
    formatLabels,
    t("modules.quotation.detail.generateOrderDialog.noSupplier"),
    t("modules.quotation.quotations.create.anyBrand"),
  );

  useEffect(() => {
    if (!open) {
      setSupplierId("");
    }
  }, [open, setSupplierId]);

  useEffect(() => {
    if (isError) {
      toast.error(t("modules.quotation.detail.toast.orderError"));
    }
  }, [isError, t]);

  const selectValue = supplierId || ALL_SUPPLIERS_VALUE;

  const onCopy = useCallback(async () => {
    if (!orderText) return;
    try {
      await navigator.clipboard.writeText(orderText);
      toast.success(t("modules.quotation.detail.toast.orderCopied"));
    } catch {
      toast.error(t("modules.quotation.detail.toast.orderCopyError"));
    }
  }, [orderText, t]);

  const onGeneratePdf = useCallback(async () => {
    if (!resolvedOrders.length) return;
    try {
      await generateOrderPdf(resolvedOrders, pdfLabels, pdfMeta);
    } catch {
      toast.error(t("modules.quotation.detail.toast.orderPdfError"));
    }
  }, [resolvedOrders, pdfLabels, pdfMeta, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-4">
        <DialogHeader>
          <DialogTitle>{t("modules.quotation.detail.generateOrderDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="order-supplier">{t("modules.quotation.detail.generateOrderDialog.supplier")}</Label>
            <Select
              value={selectValue}
              onValueChange={(value) =>
                setSupplierId(value === ALL_SUPPLIERS_VALUE ? "" : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger id="order-supplier">
                <SelectValue
                  placeholder={t("modules.quotation.detail.generateOrderDialog.allSuppliers")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SUPPLIERS_VALUE}>
                  {t("modules.quotation.detail.generateOrderDialog.allSuppliers")}
                </SelectItem>
                {supplierOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="order-text">{t("modules.quotation.detail.generateOrderDialog.order")}</Label>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <Textarea
                id="order-text"
                readOnly
                className="h-[300px] resize-none font-mono text-sm"
                value={orderText}
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            className="text-white"
            disabled={isLoading || !orderText}
            onClick={onCopy}
          >
            {t("modules.quotation.detail.generateOrderDialog.copy")}
          </Button>
          <Button
            type="button"
            className="text-white"
            disabled={isLoading || !orderText}
            onClick={onGeneratePdf}
          >
            {t("modules.quotation.detail.generateOrderDialog.generatePdf")}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("modules.quotation.detail.generateOrderDialog.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
