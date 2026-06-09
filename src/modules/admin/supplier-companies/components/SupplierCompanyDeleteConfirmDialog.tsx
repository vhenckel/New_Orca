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

type SupplierCompanyDeleteConfirmDialogProps = {
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function SupplierCompanyDeleteConfirmDialog({
  companyName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: SupplierCompanyDeleteConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modules.admin.supplierCompanies.list.deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("modules.admin.supplierCompanies.list.deleteDialog.description", { name: companyName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("modules.admin.supplierCompanies.list.deleteDialog.cancel")}
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t("modules.admin.supplierCompanies.list.deleteDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
