import { useState } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Field, FieldContent, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { toast } from "@/shared/ui/sonner";

type PackagingUnit = "ml" | "l" | "g" | "kg" | "un";

interface SupplierQuotationVariationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "bottom";
  onSave: (input: {
    parentItemId: string;
    brand: string;
    packagingAmount: string;
    packagingUnit: PackagingUnit;
  }) => void;
  parentItemId: string | null;
}

export function SupplierQuotationVariationSheet({
  open,
  onOpenChange,
  side = "right",
  onSave,
  parentItemId,
}: SupplierQuotationVariationSheetProps) {
  const { t } = useI18n();
  const [brand, setBrand] = useState("");
  const [packagingQty, setPackagingQty] = useState("");
  const [packagingUnit, setPackagingUnit] = useState<PackagingUnit>("ml");

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setBrand("");
      setPackagingQty("");
      setPackagingUnit("ml");
    }
  };

  const handleSave = () => {
    if (!parentItemId || !brand.trim() || !packagingQty.trim()) {
      toast.error(t("modules.supplierPortal.quotation.detail.items.sheetValidation"));
      return;
    }
    onSave({
      parentItemId,
      brand: brand.trim(),
      packagingAmount: packagingQty.trim(),
      packagingUnit,
    });
    handleOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side={side} className={side === "bottom" ? "max-h-[90vh] rounded-t-2xl" : "flex w-full flex-col gap-0 sm:max-w-md"}>
        <SheetHeader className={side === "right" ? "pr-8 text-left" : "text-left"}>
          <SheetTitle>{t("modules.supplierPortal.quotation.detail.items.sheetTitle")}</SheetTitle>
        </SheetHeader>
        <div className={`flex flex-col gap-4 overflow-y-auto ${side === "bottom" ? "py-2" : "px-1 py-6"}`}>
          <Field className="gap-2">
            <FieldLabel htmlFor="variation-brand">
              {t("modules.supplierPortal.quotation.detail.items.sheetBrand")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="variation-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={t("modules.supplierPortal.quotation.detail.items.brandPlaceholder")}
              />
            </FieldContent>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="variation-packaging-qty">
              {t("modules.supplierPortal.quotation.detail.items.sheetPackagingQty")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="variation-packaging-qty"
                value={packagingQty}
                onChange={(e) => setPackagingQty(e.target.value)}
                inputMode="decimal"
              />
            </FieldContent>
          </Field>
          <Field className="gap-2">
            <FieldLabel>{t("modules.supplierPortal.quotation.detail.items.sheetPackagingUnit")}</FieldLabel>
            <FieldContent>
              <Select value={packagingUnit} onValueChange={(v) => setPackagingUnit(v as PackagingUnit)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">{t("modules.supplierPortal.quotation.detail.items.packagingUnitMl")}</SelectItem>
                  <SelectItem value="l">{t("modules.supplierPortal.quotation.detail.items.packagingUnitL")}</SelectItem>
                  <SelectItem value="g">{t("modules.supplierPortal.quotation.detail.items.packagingUnitG")}</SelectItem>
                  <SelectItem value="kg">{t("modules.supplierPortal.quotation.detail.items.packagingUnitKg")}</SelectItem>
                  <SelectItem value="un">{t("modules.supplierPortal.quotation.detail.items.packagingUnitUn")}</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>
        <SheetFooter className="flex flex-row gap-2 border-t border-border pt-6 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t("modules.supplierPortal.quotation.detail.items.sheetCancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-primary text-white hover:bg-primary/90 hover:text-white"
          >
            {t("modules.supplierPortal.quotation.detail.items.sheetSave")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
