import { CheckCircle, Plus, XCircle } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import type { ProductFormSchemaValues } from "@/modules/product/lib/product-form-schema";
import type { ApprovalStatus } from "@/modules/product/lib/product-constants";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
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

interface PendingProductBrandsTableProps {
  form: UseFormReturn<ProductFormSchemaValues>;
  onApproveBrand?: (brandId: string) => void;
  onRejectBrand?: (brandId: string) => void;
  approvingBrandId?: string | null;
  rejectingBrandId?: string | null;
}

function statusVariant(status?: ApprovalStatus): "default" | "secondary" | "destructive" {
  if (status === "pending") return "secondary";
  if (status === "rejected") return "destructive";
  return "default";
}

export function PendingProductBrandsTable({
  form,
  onApproveBrand,
  onRejectBrand,
  approvingBrandId,
  rejectingBrandId,
}: PendingProductBrandsTableProps) {
  const { t } = useI18n();
  const brands = form.watch("brands");

  const addBrand = () => {
    form.setValue(
      "brands",
      [...brands, { name: "", gtin: "", status: "pending" }],
      { shouldDirty: true },
    );
  };

  const updateBrand = (index: number, field: "name" | "gtin", value: string) => {
    const next = [...brands];
    next[index] = { ...next[index], [field]: value };
    form.setValue("brands", next, { shouldDirty: true, shouldValidate: true });
  };

  const getStatusLabel = (status?: ApprovalStatus) => {
    if (status === "pending") return t("modules.product.pending.status.pending");
    if (status === "rejected") return t("modules.product.pending.status.rejected");
    return t("modules.product.pending.status.approved");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("modules.product.form.brands.title")}</h3>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addBrand}>
          <Plus className="size-4" />
          {t("modules.product.form.brands.add")}
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("modules.product.form.brands.name")}</TableHead>
              <TableHead>{t("modules.product.form.brands.gtin")}</TableHead>
              <TableHead>{t("modules.product.pending.moderation.brandStatus")}</TableHead>
              <TableHead className="w-[120px] text-right">
                {t("modules.product.list.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t("modules.product.form.brands.empty")}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand, index) => {
                const isPending = brand.status === "pending";
                const brandId = brand.id ?? "";
                const canModerate = Boolean(brandId && isPending && onApproveBrand && onRejectBrand);

                return (
                  <TableRow key={brand.id ?? `new-${index}`}>
                    <TableCell>
                      <Input
                        value={brand.name}
                        disabled={!isPending}
                        placeholder={t("modules.product.form.brands.namePlaceholder")}
                        onChange={(e) => updateBrand(index, "name", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={brand.gtin ?? ""}
                        disabled={!isPending}
                        placeholder={t("modules.product.form.brands.gtinPlaceholder")}
                        onChange={(e) => updateBrand(index, "gtin", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(brand.status)}>
                        {getStatusLabel(brand.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canModerate ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-primary"
                            disabled={approvingBrandId === brandId || rejectingBrandId === brandId}
                            onClick={() => onApproveBrand?.(brandId)}
                            aria-label={t("modules.product.pending.moderation.approveBrand")}
                          >
                            <CheckCircle className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            disabled={approvingBrandId === brandId || rejectingBrandId === brandId}
                            onClick={() => onRejectBrand?.(brandId)}
                            aria-label={t("modules.product.pending.moderation.rejectBrand")}
                          >
                            <XCircle className="size-4" />
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
