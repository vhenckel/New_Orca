import { useEffect, useState } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";

interface SupplierQuotationItemObservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineKey: string | null;
  initialValue: string;
  onSave: (lineKey: string, value: string) => void;
}

export function SupplierQuotationItemObservationDialog({
  open,
  onOpenChange,
  lineKey,
  initialValue,
  onSave,
}: SupplierQuotationItemObservationDialogProps) {
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  const handleSave = () => {
    if (!lineKey) return;
    onSave(lineKey, value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modules.supplierPortal.quotation.detail.items.observationDialogTitle")}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("modules.supplierPortal.quotation.detail.items.observationPlaceholder")}
          rows={4}
          maxLength={255}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("modules.supplierPortal.quotation.detail.items.sheetCancel")}
          </Button>
          <Button type="button" onClick={handleSave}>
            {t("modules.supplierPortal.quotation.detail.items.sheetSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
