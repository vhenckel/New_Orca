import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  fetchProductSuppliers,
  updateProductSuppliers,
} from "@/modules/buyer/quotation/api/product-supplier-api";
import { ApiError } from "@/shared/api/http-client";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { toast } from "@/shared/ui/sonner";

type BudgetProductSuppliersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  establishmentId: string;
};

export function BudgetProductSuppliersDialog({
  open,
  onOpenChange,
  productId,
  productName,
  establishmentId,
}: BudgetProductSuppliersDialogProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const queryKey = ["product-supplier", productId, establishmentId];

  const { data: suppliers = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchProductSuppliers(productId, establishmentId),
    enabled: open && Boolean(productId) && Boolean(establishmentId),
  });

  useEffect(() => {
    if (!open) return;
    setSelectedIds(suppliers.filter((s) => s.active).map((s) => s.id));
  }, [open, suppliers]);

  useEffect(() => {
    if (isError) {
      toast.error(t("modules.quotation.quotations.create.toastSuppliersError"));
    }
  }, [isError, t]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProductSuppliers(productId, establishmentId, {
        supplierIds: selectedIds,
        active: true,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success(t("modules.quotation.quotations.create.toastSuppliersSaved"));
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modules.quotation.quotations.create.toastSuppliersSaveError");
      toast.error(message);
    },
  });

  function toggleSupplier(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((item) => item !== id);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modules.quotation.quotations.create.suppliersTitle")}</DialogTitle>
          <p className="text-sm text-muted-foreground">{productName}</p>
        </DialogHeader>
        <ScrollArea className="max-h-64 pr-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t("modules.quotation.quotations.create.suppliersLoading")}
            </p>
          ) : suppliers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("modules.quotation.quotations.create.suppliersEmpty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {suppliers.map((supplier) => (
                <li key={supplier.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`supplier-${supplier.id}`}
                    checked={selectedIds.includes(supplier.id)}
                    onCheckedChange={(checked) => toggleSupplier(supplier.id, checked === true)}
                  />
                  <Label htmlFor={`supplier-${supplier.id}`} className="font-normal">
                    {supplier.name}
                  </Label>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("modules.quotation.quotations.create.cancel")}
          </Button>
          <Button
            type="button"
            className="text-white"
            disabled={saveMutation.isPending || isLoading}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending
              ? t("modules.quotation.quotations.create.saving")
              : t("modules.quotation.quotations.create.suppliersSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
