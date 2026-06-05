import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { fetchEstablishmentProductBrands } from "@/modules/product/api/establishment-products-api";
import { useEstablishmentProductVariationManagement } from "@/modules/product/hooks/useEstablishmentProductVariationManagement";
import type { EstablishmentProductWithVariants } from "@/modules/product/types/product-form";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Switch } from "@/shared/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export type ProductVariationsSectionHandle = {
  saveVariations: () => Promise<unknown>;
  resetToOriginal: () => void;
  hasChanges: boolean;
};

type ProductVariationsSectionProps = {
  selectedProduct: EstablishmentProductWithVariants | null;
  establishmentId: string;
  sectionRef?: React.MutableRefObject<ProductVariationsSectionHandle | null>;
};

export function ProductVariationsSection({
  selectedProduct,
  establishmentId,
  sectionRef,
}: ProductVariationsSectionProps) {
  const { t } = useI18n();
  const {
    variations,
    addNewVariation,
    updateVariation,
    removeVariation,
    addBrandToVariation,
    removeBrandFromVariation,
    saveVariations,
    isSaving,
    resetToOriginal,
    hasChanges,
  } = useEstablishmentProductVariationManagement({ selectedProduct, establishmentId });

  if (sectionRef) {
    sectionRef.current = {
      saveVariations,
      resetToOriginal,
      hasChanges,
    };
  }

  if (!selectedProduct) {
    return (
      <p className="text-sm text-muted-foreground">{t("modules.product.form.variations.selectProduct")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("modules.product.form.variations.title")}</h3>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addNewVariation}>
          <Plus className="size-4" />
          {t("modules.product.form.variations.add")}
        </Button>
      </div>

      {variations.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          {t("modules.product.form.variations.empty")}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {variations.map((variation, index) => (
            <VariationCollapsibleItem
              key={variation.id}
              variationId={variation.id}
              title={t("modules.product.form.variations.itemTitle", { index: index + 1 })}
              brands={variation.brands}
              quoteAnyBrand={variation.quoteAnyBrand}
              productId={selectedProduct.productId}
              establishmentId={establishmentId}
              establishmentProductId={variation.establishmentProductId}
              defaultOpen={index === 0}
              onQuoteAnyBrandChange={(checked) =>
                updateVariation(variation.id, { quoteAnyBrand: checked })
              }
              onAddBrand={(brand) => addBrandToVariation(variation.id, brand)}
              onRemoveBrand={(brandId) => removeBrandFromVariation(variation.id, brandId)}
              onRemoveVariation={() => removeVariation(variation.id)}
              canRemove={variations.length > 1}
            />
          ))}
        </div>
      )}

      {isSaving ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {t("modules.product.form.variations.saving")}
        </div>
      ) : null}
    </div>
  );
}

type VariationCollapsibleItemProps = {
  variationId: string;
  title: string;
  brands: Array<{ id: string; name: string }>;
  quoteAnyBrand: boolean;
  productId: string;
  establishmentId: string;
  establishmentProductId?: string;
  defaultOpen?: boolean;
  onQuoteAnyBrandChange: (checked: boolean) => void;
  onAddBrand: (brand: { id: string; name: string; isNew?: boolean }) => void;
  onRemoveBrand: (brandId: string) => void;
  onRemoveVariation: () => void;
  canRemove: boolean;
};

function VariationCollapsibleItem({
  variationId,
  title,
  brands,
  quoteAnyBrand,
  productId,
  establishmentId,
  establishmentProductId,
  defaultOpen,
  onQuoteAnyBrandChange,
  onAddBrand,
  onRemoveBrand,
  onRemoveVariation,
  canRemove,
}: VariationCollapsibleItemProps) {
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: availableBrands = [], isLoading } = useQuery({
    queryKey: [
      "establishment-product-brands",
      establishmentId,
      productId,
      establishmentProductId,
      search,
    ],
    queryFn: () =>
      fetchEstablishmentProductBrands({
        establishmentId,
        productId,
        establishmentProductId,
      }),
    enabled: pickerOpen && Boolean(establishmentId && productId),
  });

  const filtered = availableBrands.filter((b) =>
    b.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-lg border">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id={`quote-${variationId}`}
                checked={quoteAnyBrand}
                onCheckedChange={onQuoteAnyBrandChange}
              />
              <Label htmlFor={`quote-${variationId}`}>
                {t("modules.product.form.variations.quoteAnyBrand")}
              </Label>
            </div>
            {canRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={onRemoveVariation}
              >
                <Trash2 className="mr-2 size-4" />
                {t("modules.product.form.variations.remove")}
              </Button>
            ) : null}
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("modules.product.form.brands.name")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      {t("modules.product.form.variations.noBrands")}
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>{brand.name}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => onRemoveBrand(brand.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="w-fit gap-2">
                <Plus className="size-4" />
                {t("modules.product.form.variations.addBrand")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={t("modules.product.form.variations.searchBrand")}
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoading
                      ? t("modules.product.form.loading")
                      : t("modules.product.form.variations.brandEmpty")}
                  </CommandEmpty>
                  <CommandGroup>
                    {search.trim() &&
                    !filtered.some(
                      (b) => b.name.toLowerCase() === search.trim().toLowerCase(),
                    ) ? (
                      <CommandItem
                        value={`new-${search}`}
                        onSelect={() => {
                          onAddBrand({
                            id: crypto.randomUUID(),
                            name: search.trim(),
                            isNew: true,
                          });
                          setPickerOpen(false);
                          setSearch("");
                        }}
                      >
                        {t("modules.product.form.variations.createBrand", { name: search.trim() })}
                      </CommandItem>
                    ) : null}
                    {filtered.map((brand) => (
                      <CommandItem
                        key={brand.id}
                        value={brand.name}
                        disabled={brands.some((b) => b.id === brand.id)}
                        onSelect={() => {
                          onAddBrand({ id: brand.id, name: brand.name });
                          setPickerOpen(false);
                          setSearch("");
                        }}
                      >
                        {brand.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
