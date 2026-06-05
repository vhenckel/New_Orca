import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo } from "react";

import {
  fetchProductQuotations,
  selectProductQuotation,
} from "@/modules/buyer/quotation/api/budgets-api";
import { viewBudgetQueryKey } from "@/modules/buyer/quotation/hooks/useViewBudget";
import {
  formatCheapestPercentAbove,
  formatViewBudgetCurrency,
  formatViewBudgetPackaging,
  formatViewBudgetProductBrands,
  formatViewBudgetText,
} from "@/modules/buyer/quotation/lib/view-budget-display";
import type { BudgetStatus } from "@/modules/buyer/quotation/types/budget";
import type { BudgetViewProduct, ProductQuotation } from "@/modules/buyer/quotation/types/view-budget";
import { ApiError } from "@/shared/api/http-client";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { toast } from "@/shared/ui/sonner";

type ViewBudgetProductQuotationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string;
  product: BudgetViewProduct | null;
  budgetStatus: BudgetStatus | undefined;
};

function findLowestUnitValue(rows: ProductQuotation[]): number | null {
  const values = rows.map((r) => r.unitValue).filter((v) => v > 0);
  if (values.length === 0) return null;
  return Math.min(...values);
}

export function ViewBudgetProductQuotationDialog({
  open,
  onOpenChange,
  budgetId,
  product,
  budgetStatus,
}: ViewBudgetProductQuotationDialogProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const productId = product?.id ?? "";
  const canSelect = budgetStatus === "finished";

  const { data: quotations = [], isLoading, isError } = useQuery({
    queryKey: [...viewBudgetQueryKey(budgetId), "quotations", productId],
    queryFn: () =>
      fetchProductQuotations(budgetId, productId, { sort: "value", order: "ASC" }),
    enabled: open && Boolean(productId),
  });

  useEffect(() => {
    if (isError) {
      toast.error(t("modules.quotation.detail.toast.quotationsError"));
    }
  }, [isError, t]);

  const lowestUnit = useMemo(() => findLowestUnitValue(quotations), [quotations]);

  const selectMutation = useMutation({
    mutationFn: (quotationItemId?: string) =>
      selectProductQuotation(budgetId, productId, { quotationItemId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: viewBudgetQueryKey(budgetId) });
      toast.success(t("modules.quotation.detail.toast.selectionSaved"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modules.quotation.detail.toast.selectionError");
      toast.error(message);
    },
  });

  const anyBrandLabel = t("modules.quotation.quotations.create.anyBrand");

  if (!product) return null;

  const productTitle = product.name;
  const brandLabel = formatViewBudgetProductBrands(product, anyBrandLabel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{t("modules.quotation.detail.quotationDialog.title")}</DialogTitle>
          <DialogDescription>
            {productTitle}
            {brandLabel ? ` · ${brandLabel}` : ""}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[min(60vh,520px)]">
          <div className="px-6 py-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                {t("modules.quotation.detail.quotationDialog.loading")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>{t("modules.quotation.detail.quotationDialog.supplier")}</TableHead>
                    <TableHead>{t("modules.quotation.detail.quotationDialog.brand")}</TableHead>
                    <TableHead className="text-right">
                      {t("modules.quotation.detail.quotationDialog.unitPrice")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("modules.quotation.detail.quotationDialog.total")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("modules.quotation.detail.quotationDialog.diff")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("modules.quotation.detail.quotationDialog.percentAbove")}
                    </TableHead>
                    <TableHead>{t("modules.quotation.detail.quotationDialog.payment")}</TableHead>
                    <TableHead>{t("modules.quotation.detail.quotationDialog.delivery")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={!quotations.some((q) => q.isSelected)}
                        disabled={!canSelect || selectMutation.isPending}
                        onCheckedChange={() => {
                          if (!canSelect) return;
                          selectMutation.mutate(undefined);
                        }}
                        aria-label={t("modules.quotation.detail.quotationDialog.none")}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {t("modules.quotation.detail.quotationDialog.none")}
                    </TableCell>
                    <TableCell colSpan={7} />
                  </TableRow>
                  {quotations.map((row) => {
                    const isLowest =
                      lowestUnit != null && row.unitValue > 0 && row.unitValue === lowestUnit;
                    const unitClass =
                      row.unitValue > 0
                        ? isLowest
                          ? "text-success"
                          : "text-destructive"
                        : undefined;

                    return (
                      <TableRow
                        key={row.id}
                        className={cn(isLowest && "bg-success/5")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={row.isSelected}
                            disabled={!canSelect || selectMutation.isPending}
                            onCheckedChange={() => {
                              if (!canSelect) return;
                              selectMutation.mutate(row.id);
                            }}
                            aria-label={row.supplier}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {row.differentFromRequest ? (
                              <AlertTriangle className="size-4 shrink-0 text-warning" />
                            ) : null}
                            <span className="font-medium">{row.supplier}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span>{row.brand?.name ?? "—"}</span>
                            <span className="text-xs">
                              {formatViewBudgetPackaging(row.packagingUnit)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className={cn("text-right tabular-nums font-medium", unitClass)}>
                          {formatViewBudgetCurrency(row.unitValue)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatViewBudgetCurrency(row.totalValue)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-warning">
                          {formatViewBudgetCurrency(row.differenceCheapest)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatCheapestPercentAbove(row.totalValue, row.differenceCheapest)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatViewBudgetText(row.paymentTerm)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatViewBudgetText(row.deliveryDeadline)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && quotations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        {t("modules.quotation.detail.quotationDialog.empty")}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("modules.quotation.detail.quotationDialog.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
