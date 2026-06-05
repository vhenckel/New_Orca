import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { SegmentOption } from "@/modules/buyer/quotation/api/segments-api";
import type { EstablishmentOption } from "@/modules/buyer/quotation/types/create-budget";
import {
  PACKAGING_UNIT_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
} from "@/modules/product/lib/product-constants";
import type { ProductFormSchemaValues } from "@/modules/product/lib/product-form-schema";
import type { EstablishmentProductWithVariants } from "@/modules/product/types/product-form";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type ProductCoreFieldsProps = {
  form: UseFormReturn<ProductFormSchemaValues>;
  isAdmin: boolean;
  isEstablishment: boolean;
  coreDisabled: boolean;
  segments: SegmentOption[];
  establishments: EstablishmentOption[];
  showEstablishmentField: boolean;
  establishmentProducts: EstablishmentProductWithVariants[];
  productsLoading: boolean;
  onProductSearch: (term: string) => void;
  onSelectExistingProduct: (product: EstablishmentProductWithVariants | null) => void;
  onCreateNewProduct: (name: string) => void;
  selectedProductLabel?: string | null;
};

export function ProductCoreFields({
  form,
  isAdmin,
  isEstablishment,
  coreDisabled,
  segments,
  establishments,
  showEstablishmentField,
  establishmentProducts,
  productsLoading,
  onProductSearch,
  onSelectExistingProduct,
  onCreateNewProduct,
  selectedProductLabel,
}: ProductCoreFieldsProps) {
  const { t } = useI18n();
  const [nameOpen, setNameOpen] = useState(false);
  const [segmentsOpen, setSegmentsOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState("");

  const unitType = form.watch("unitType");
  const segmentIds = form.watch("segmentIds");
  const nameValue = form.watch("name");

  const displayName = useMemo(() => {
    if (nameValue.startsWith("new_")) return nameValue.substring(4);
    const match = establishmentProducts.find(
      (p) => p.productId === nameValue || p.establishmentProductId === nameValue,
    );
    return match?.name ?? selectedProductLabel ?? nameValue;
  }, [nameValue, establishmentProducts, selectedProductLabel]);

  const toggleSegment = (id: string) => {
    const next = segmentIds.includes(id)
      ? segmentIds.filter((s) => s !== id)
      : [...segmentIds, id];
    form.setValue("segmentIds", next, { shouldDirty: true, shouldValidate: true });
  };

  const filteredProducts = establishmentProducts;
  const trimmedSearch = nameSearch.trim();
  const showCreateOption =
    isEstablishment &&
    trimmedSearch.length > 0 &&
    !filteredProducts.some((p) => p.name.toLowerCase() === trimmedSearch.toLowerCase());

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {showEstablishmentField ? (
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label>{t("modules.product.form.establishment")}</Label>
          <Select
            value={form.watch("establishmentId") || ""}
            disabled={coreDisabled}
            onValueChange={(value) => {
              form.setValue("establishmentId", value, { shouldDirty: true, shouldValidate: true });
              form.setValue("name", "", { shouldDirty: true });
              onSelectExistingProduct(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("modules.product.form.establishmentPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {establishments.map((est) => (
                <SelectItem key={est.id} value={est.id}>
                  {est.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 md:col-span-2">
        <Label>{t("modules.product.form.name")}</Label>
        {isAdmin ? (
          <Input
            value={nameValue}
            disabled={coreDisabled}
            placeholder={t("modules.product.form.namePlaceholder")}
            onChange={(e) =>
              form.setValue("name", e.target.value, { shouldDirty: true, shouldValidate: true })
            }
          />
        ) : (
          <Popover open={nameOpen} onOpenChange={setNameOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                disabled={coreDisabled}
                className="w-full justify-between font-normal"
              >
                {displayName || t("modules.product.form.namePlaceholder")}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={t("modules.product.form.nameSearch")}
                  value={nameSearch}
                  onValueChange={(value) => {
                    setNameSearch(value);
                    onProductSearch(value);
                  }}
                />
                <CommandList>
                  <CommandEmpty>
                    {productsLoading
                      ? t("modules.product.form.loading")
                      : t("modules.product.form.nameEmpty")}
                  </CommandEmpty>
                  <CommandGroup>
                    {showCreateOption ? (
                      <CommandItem
                        value={`new_${trimmedSearch}`}
                        onSelect={() => {
                          const token = `new_${trimmedSearch}`;
                          form.setValue("name", token, { shouldDirty: true, shouldValidate: true });
                          form.setValue("status", "pending", { shouldDirty: true });
                          onCreateNewProduct(trimmedSearch);
                          onSelectExistingProduct(null);
                          setNameOpen(false);
                          setNameSearch("");
                        }}
                      >
                        {t("modules.product.form.createProduct", { name: trimmedSearch })}
                      </CommandItem>
                    ) : null}
                    {filteredProducts.map((product) => (
                      <CommandItem
                        key={product.productId}
                        value={product.name}
                        onSelect={() => {
                          form.setValue("name", product.productId, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          form.setValue("status", product.status, { shouldDirty: true });
                          form.setValue("unitType", product.unitType as "kg" | "un", {
                            shouldDirty: true,
                          });
                          form.setValue(
                            "packagingUnit",
                            product.packagingUnit
                              ? {
                                  unit: product.packagingUnit.unit as never,
                                  weight: product.packagingUnit.weight,
                                }
                              : { unit: undefined, weight: undefined },
                            { shouldDirty: true },
                          );
                          form.setValue(
                            "segmentIds",
                            product.segments.map((s) => s.id),
                            { shouldDirty: true, shouldValidate: true },
                          );
                          if (!showEstablishmentField && product.establishment?.id) {
                            form.setValue("establishmentId", product.establishment.id, {
                              shouldDirty: true,
                            });
                          }
                          onSelectExistingProduct(product);
                          setNameOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            nameValue === product.productId ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {product.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <Label>{t("modules.product.form.segments")}</Label>
        <Popover open={segmentsOpen} onOpenChange={setSegmentsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={coreDisabled}
              className="h-auto min-h-10 w-full justify-start gap-2 px-3 py-2 font-normal"
            >
              {segmentIds.length === 0 ? (
                <span className="text-muted-foreground">{t("modules.product.form.segmentsPlaceholder")}</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {segmentIds.map((id) => {
                    const segment = segments.find((s) => s.id === id);
                    return (
                      <Badge key={id} variant="secondary">
                        {segment?.name ?? id}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder={t("modules.product.form.segmentsSearch")} />
              <CommandList>
                <CommandEmpty>{t("modules.product.form.segmentsEmpty")}</CommandEmpty>
                <CommandGroup>
                  {segments.map((segment) => (
                    <CommandItem
                      key={segment.id}
                      value={segment.name}
                      onSelect={() => toggleSegment(segment.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          segmentIds.includes(segment.id) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {segment.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("modules.product.form.unitType")}</Label>
        <Select
          value={unitType}
          disabled={coreDisabled}
          onValueChange={(value) =>
            form.setValue("unitType", value as "kg" | "un", { shouldDirty: true, shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_UNIT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.labelKey as never)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {unitType === "un" ? (
        <>
          <div className="flex flex-col gap-2">
            <Label>{t("modules.product.form.packagingWeight")}</Label>
            <Input
              type="number"
              step="0.001"
              min={0}
              max={99999.999}
              disabled={coreDisabled}
              value={form.watch("packagingUnit")?.weight ?? ""}
              onChange={(e) => {
                const weight = e.target.value === "" ? undefined : Number(e.target.value);
                form.setValue(
                  "packagingUnit",
                  { ...form.watch("packagingUnit"), weight },
                  { shouldDirty: true, shouldValidate: true },
                );
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("modules.product.form.packagingUnit")}</Label>
            <Select
              value={form.watch("packagingUnit")?.unit ?? ""}
              disabled={coreDisabled}
              onValueChange={(value) =>
                form.setValue(
                  "packagingUnit",
                  {
                    ...form.watch("packagingUnit"),
                    unit: value as never,
                  },
                  { shouldDirty: true, shouldValidate: true },
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("modules.product.form.packagingUnitPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {PACKAGING_UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      {isAdmin ? (
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label>{t("modules.product.form.ncm")}</Label>
          <Input
            value={form.watch("ncm") ?? ""}
            disabled={coreDisabled}
            maxLength={8}
            placeholder={t("modules.product.form.ncmPlaceholder")}
            onChange={(e) =>
              form.setValue("ncm", e.target.value.replace(/\D/g, ""), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
