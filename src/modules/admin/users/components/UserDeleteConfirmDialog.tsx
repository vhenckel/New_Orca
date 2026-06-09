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

type UserDeleteConfirmDialogProps = {
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function UserDeleteConfirmDialog({
  userName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: UserDeleteConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modules.admin.users.list.deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("modules.admin.users.list.deleteDialog.description", { name: userName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("modules.admin.users.list.deleteDialog.cancel")}
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t("modules.admin.users.list.deleteDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
