import { Plus, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import type { ProductFormSchemaValues } from "@/modules/product/lib/product-form-schema";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type ProductBrandsTableProps = {
  form: UseFormReturn<ProductFormSchemaValues>;
  disabled?: boolean;
};

export function ProductBrandsTable({ form, disabled }: ProductBrandsTableProps) {
  const { t } = useI18n();
  const brands = form.watch("brands");

  const addBrand = () => {
    form.setValue("brands", [...brands, { name: "", gtin: "" }], { shouldDirty: true });
  };

  const removeBrand = (index: number) => {
    form.setValue(
      "brands",
      brands.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  const updateBrand = (index: number, field: "name" | "gtin", value: string) => {
    const next = [...brands];
    next[index] = { ...next[index], [field]: value };
    form.setValue("brands", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("modules.product.form.brands.title")}</h3>
        {!disabled ? (
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addBrand}>
            <Plus className="size-4" />
            {t("modules.product.form.brands.add")}
          </Button>
        ) : null}
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("modules.product.form.brands.name")}</TableHead>
              <TableHead>{t("modules.product.form.brands.gtin")}</TableHead>
              {!disabled ? <TableHead className="w-12" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={disabled ? 2 : 3} className="text-center text-muted-foreground">
                  {t("modules.product.form.brands.empty")}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand, index) => (
                <TableRow key={brand.id ?? `new-${index}`}>
                  <TableCell>
                    <Input
                      value={brand.name}
                      disabled={disabled}
                      placeholder={t("modules.product.form.brands.namePlaceholder")}
                      onChange={(e) => updateBrand(index, "name", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={brand.gtin ?? ""}
                      disabled={disabled}
                      placeholder={t("modules.product.form.brands.gtinPlaceholder")}
                      onChange={(e) => updateBrand(index, "gtin", e.target.value)}
                    />
                  </TableCell>
                  {!disabled ? (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeBrand(index)}
                        aria-label={t("modules.product.form.brands.remove")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
