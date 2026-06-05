import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchBrands } from "@/modules/buyer/quotation/api/brands-api";
import { addProductWithBrandsToEstablishment } from "@/modules/buyer/quotation/api/establishment-products-api";
import { fetchProductById, type PlatformProduct } from "@/modules/buyer/quotation/api/products-api";
import { formatProductNameWithPackaging } from "@/modules/buyer/quotation/lib/platform-product-display";
import type { EstablishmentProduct } from "@/modules/buyer/quotation/types/create-budget";
import { ApiError } from "@/shared/api/http-client";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { Switch } from "@/shared/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { toast } from "@/shared/ui/sonner";

type BrandRow = {
  id: string;
  name: string;
  isNew?: boolean;
};

type ManagePlatformProductBrandsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PlatformProduct | null;
  establishmentId: string;
  initialBrandId?: string;
  onAdded: (product: EstablishmentProduct) => void;
};

export function ManagePlatformProductBrandsDialog({
  open,
  onOpenChange,
  product,
  establishmentId,
  initialBrandId,
  onAdded,
}: ManagePlatformProductBrandsDialogProps) {
  const { t } = useI18n();
  const productId = product?.id;

  const [quoteAnyBrand, setQuoteAnyBrand] = useState(false);
  const [brandsInTable, setBrandsInTable] = useState<BrandRow[]>([]);
  const [pendingNewBrands, setPendingNewBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<{ id: string; name: string } | null>(null);
  const [brandSearch, setBrandSearch] = useState("");
  const [debouncedBrandSearch, setDebouncedBrandSearch] = useState("");
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedBrandSearch(brandSearch), 300);
    return () => window.clearTimeout(timer);
  }, [brandSearch]);

  const { data: productDetail, isLoading: productLoading } = useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => fetchProductById(productId!),
    enabled: open && Boolean(productId),
  });

  const { data: brandOptions = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["brands", productId, establishmentId, debouncedBrandSearch],
    queryFn: () =>
      fetchBrands({
        name: debouncedBrandSearch.trim() || undefined,
        productId,
        establishmentId,
        status: "approved",
      }),
    enabled: open && Boolean(productId),
  });

  const tableRows = useMemo<BrandRow[]>(
    () => [
      ...brandsInTable,
      ...pendingNewBrands.map((name) => ({ id: name, name, isNew: true })),
    ],
    [brandsInTable, pendingNewBrands],
  );

  const creatableBrandName = brandSearch.trim();

  useEffect(() => {
    if (!open || !product) return;
    setQuoteAnyBrand(false);
    setPendingNewBrands([]);
    setSelectedBrand(null);
    setBrandSearch("");

    if (initialBrandId) {
      const match = product.brands.find((b) => b.id === initialBrandId);
      setBrandsInTable(match ? [{ id: match.id, name: match.name }] : []);
      return;
    }
    setBrandsInTable([]);
  }, [open, product, initialBrandId]);

  function resetState() {
    setQuoteAnyBrand(false);
    setBrandsInTable([]);
    setPendingNewBrands([]);
    setSelectedBrand(null);
    setBrandSearch("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetState();
    onOpenChange(next);
  }

  function handleAddBrand() {
    if (!selectedBrand) {
      toast.error(t("modules.quotation.quotations.create.platformSelectBrand"));
      return;
    }
    if (brandsInTable.some((b) => b.id === selectedBrand.id)) {
      toast.error(t("modules.quotation.quotations.create.platformBrandAlreadyAdded"));
      return;
    }
    setBrandsInTable((prev) => [...prev, selectedBrand]);
    setSelectedBrand(null);
    setBrandSearch("");
    setBrandPickerOpen(false);
  }

  function handleCreateNewBrand(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    if (
      brandsInTable.some((b) => b.name.toLowerCase() === lower) ||
      pendingNewBrands.some((b) => b.toLowerCase() === lower)
    ) {
      toast.error(t("modules.quotation.quotations.create.platformBrandAlreadyAdded"));
      return;
    }

    setPendingNewBrands((prev) => [...prev, trimmed]);
    setSelectedBrand(null);
    setBrandSearch("");
    setBrandPickerOpen(false);
  }

  function handleRemoveBrand(row: BrandRow) {
    if (row.isNew) {
      setPendingNewBrands((prev) => prev.filter((name) => name !== row.id));
      return;
    }
    setBrandsInTable((prev) => prev.filter((b) => b.id !== row.id));
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      addProductWithBrandsToEstablishment({
        establishmentId,
        productId: productId!,
        quoteAnyBrand,
        brandIds: quoteAnyBrand ? [] : brandsInTable.map((b) => b.id),
        newBrandNames: pendingNewBrands,
      }),
    onSuccess: (created) => {
      toast.success(t("modules.quotation.quotations.create.toastPlatformVariationCreated"));
      onAdded(created);
      handleOpenChange(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modules.quotation.quotations.create.toastPlatformProductAddError");
      toast.error(message);
    },
  });

  function handleSave() {
    if (!productId) return;
    if (!quoteAnyBrand && brandsInTable.length === 0 && pendingNewBrands.length === 0) {
      toast.error(t("modules.quotation.quotations.create.platformBrandsRequired"));
      return;
    }
    saveMutation.mutate();
  }

  if (!product) return null;

  const displayProduct = productDetail ?? product;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-4xl flex-col gap-4"
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest("[data-radix-popper-content-wrapper]")) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest("[data-radix-popper-content-wrapper]")) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("modules.quotation.quotations.create.platformManageBrandsTitle")}</DialogTitle>
        </DialogHeader>

        {productLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-medium">{t("modules.quotation.quotations.create.platformProductName")}</span>
              <span className="text-muted-foreground">
                {formatProductNameWithPackaging(displayProduct)}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-medium">{t("modules.quotation.quotations.create.platformProductType")}</span>
              <span className="text-muted-foreground">{displayProduct.unitType}</span>
            </div>
            {displayProduct.segments.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{t("modules.quotation.quotations.create.platformProductSegments")}</span>
                <div className="flex flex-wrap gap-1.5">
                  {displayProduct.segments.map((segment) => (
                    <Badge
                      key={segment.id}
                      variant="secondary"
                      className="border border-orange-200/80 bg-orange-50 font-normal text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-100"
                    >
                      {segment.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Label className="leading-none">
                {t("modules.quotation.quotations.create.platformAddBrandLabel")}
              </Label>
              <Popover modal open={brandPickerOpen} onOpenChange={setBrandPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full max-w-sm justify-between font-normal"
                    disabled={quoteAnyBrand}
                  >
                    <span className={cn("truncate", !selectedBrand && "text-muted-foreground")}>
                      {selectedBrand
                        ? selectedBrand.name
                        : t("modules.quotation.quotations.create.platformSelectBrandPlaceholder")}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[200] w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
                  align="start"
                  onOpenAutoFocus={(event) => event.preventDefault()}
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder={t("modules.quotation.quotations.create.platformBrandSearchPlaceholder")}
                      value={brandSearch}
                      onValueChange={(value) => {
                        setBrandSearch(value);
                        setSelectedBrand(null);
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {brandsLoading
                          ? t("modules.quotation.quotations.create.platformLoading")
                          : t("modules.quotation.quotations.create.platformBrandSearchEmpty")}
                      </CommandEmpty>
                      <CommandGroup>
                        {brandOptions.map((brand) => (
                          <CommandItem
                            key={brand.id}
                            value={brand.name}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            onSelect={() => {
                              setSelectedBrand({ id: brand.id, name: brand.name });
                              setBrandSearch("");
                              setBrandPickerOpen(false);
                            }}
                          >
                            {brand.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {creatableBrandName ? (
                        <CommandGroup>
                          <CommandItem
                            value={`create-${creatableBrandName}`}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            onSelect={() => handleCreateNewBrand(creatableBrandName)}
                          >
                            {t("modules.quotation.quotations.create.platformCreateBrand", {
                              name: creatableBrandName,
                            })}
                          </CommandItem>
                        </CommandGroup>
                      ) : null}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 sm:mb-0"
              disabled={quoteAnyBrand || !selectedBrand}
              onClick={handleAddBrand}
            >
              {t("modules.quotation.quotations.create.platformAddBrandButton")}
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:pb-0.5">
            <Label htmlFor="manage-quote-any-brand" className="text-sm font-normal">
              {t("modules.quotation.quotations.create.platformQuoteAnyBrand")}
            </Label>
            <Switch
              id="manage-quote-any-brand"
              checked={quoteAnyBrand}
              onCheckedChange={setQuoteAnyBrand}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <ScrollArea className="max-h-56">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>{t("modules.quotation.quotations.create.platformBrandColumn")}</TableHead>
                  <TableHead className="w-20 text-right">
                    {t("modules.quotation.quotations.create.platformTableActions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      {t("modules.quotation.quotations.create.platformBrandsTableEmpty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows.map((row) => (
                    <TableRow key={`${row.id}-${row.isNew ? "new" : "existing"}`}>
                      <TableCell>
                        {row.name}
                        {row.isNew ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({t("modules.quotation.quotations.create.platformBrandNew")})
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          disabled={quoteAnyBrand}
                          onClick={() => handleRemoveBrand(row)}
                          aria-label={t("modules.quotation.quotations.create.remove")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t("modules.quotation.quotations.create.platformClose")}
          </Button>
          <Button
            type="button"
            className="text-white"
            disabled={saveMutation.isPending || productLoading}
            onClick={handleSave}
          >
            {saveMutation.isPending
              ? t("modules.quotation.quotations.create.saving")
              : t("modules.quotation.quotations.create.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
