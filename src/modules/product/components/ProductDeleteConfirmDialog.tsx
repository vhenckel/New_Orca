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

type ProductDeleteConfirmDialogProps = {
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function ProductDeleteConfirmDialog({
  productName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: ProductDeleteConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modules.product.list.deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("modules.product.list.deleteDialog.description", { name: productName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            {t("modules.product.list.deleteDialog.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {t("modules.product.list.deleteDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
