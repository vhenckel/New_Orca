import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchEstablishmentProductBrands } from "@/modules/product/api/establishment-products-api";
import { addProductWithBrandsToEstablishment } from "@/modules/buyer/quotation/api/establishment-products-api";
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
import { Switch } from "@/shared/ui/switch";
import { toast } from "@/shared/ui/sonner";

interface AddProductWithBrandsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentId: string;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

export function AddProductWithBrandsDialog({
  open,
  onOpenChange,
  establishmentId,
  productId,
  productName,
  onSuccess,
}: AddProductWithBrandsDialogProps) {
  const { t } = useI18n();
  const [quoteAnyBrand, setQuoteAnyBrand] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const brandsQuery = useQuery({
    queryKey: ["establishment-product-brands", establishmentId, productId],
    queryFn: () =>
      fetchEstablishmentProductBrands({
        establishmentId,
        productId,
      }),
    enabled: open && Boolean(productId),
  });

  const approvedBrands = (brandsQuery.data ?? []).filter((brand) => brand.status === "approved");

  useEffect(() => {
    if (!open) {
      setQuoteAnyBrand(false);
      setSelectedBrandIds([]);
    }
  }, [open]);

  const toggleBrand = (brandId: string, checked: boolean) => {
    setSelectedBrandIds((prev) =>
      checked ? [...prev, brandId] : prev.filter((id) => id !== brandId),
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addProductWithBrandsToEstablishment({
        establishmentId,
        productId,
        quoteAnyBrand: quoteAnyBrand || undefined,
        brandIds: quoteAnyBrand ? undefined : selectedBrandIds.length ? selectedBrandIds : undefined,
      });
      toast.success(t("modules.admin.establishments.products.toast.linkSuccess"));
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error(t("modules.admin.establishments.products.toast.linkError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modules.admin.establishments.products.addDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label>{t("modules.admin.establishments.products.addDialog.product")}</Label>
            <p className="text-sm font-medium">{productName}</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="quote-any-brand">
              {t("modules.admin.establishments.products.addDialog.quoteAnyBrand")}
            </Label>
            <Switch
              id="quote-any-brand"
              checked={quoteAnyBrand}
              onCheckedChange={setQuoteAnyBrand}
            />
          </div>

          {!quoteAnyBrand ? (
            <div className="flex flex-col gap-2">
              <Label>{t("modules.admin.establishments.products.addDialog.brands")}</Label>
              {brandsQuery.isLoading ? (
                <div className="flex justify-center py-4">
                  <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : approvedBrands.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("modules.admin.establishments.products.addDialog.noBrands")}
                </p>
              ) : (
                <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                  {approvedBrands.map((brand) => (
                    <label key={brand.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedBrandIds.includes(brand.id)}
                        onCheckedChange={(checked) => toggleBrand(brand.id, checked === true)}
                      />
                      {brand.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("modules.admin.establishments.products.addDialog.cancel")}
          </Button>
          <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            {t("modules.admin.establishments.products.addDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
