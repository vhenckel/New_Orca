import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type SupplierDeleteConfirmDialogProps = {
  supplierName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function SupplierDeleteConfirmDialog({
  supplierName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: SupplierDeleteConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modules.suppliers.list.deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("modules.suppliers.list.deleteDialog.description", { name: supplierName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("modules.suppliers.list.deleteDialog.cancel")}
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t("modules.suppliers.list.deleteDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
