import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ManagePlatformProductBrandsDialog } from "@/modules/buyer/quotation/components/ManagePlatformProductBrandsDialog";
import { CreateEstablishmentProductDialog } from "@/modules/buyer/quotation/components/CreateEstablishmentProductDialog";
import {
  fetchApprovedProducts,
  type PlatformProduct,
} from "@/modules/buyer/quotation/api/products-api";
import {
  formatPlatformProductLabel,
  formatProductNameTitle,
  resolveInitialPlatformBrandId,
} from "@/modules/buyer/quotation/lib/platform-product-display";
import type { EstablishmentProduct } from "@/modules/buyer/quotation/types/create-budget";
import { ApiError } from "@/shared/api/http-client";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { toast } from "@/shared/ui/sonner";

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function filterPlatformProducts(products: PlatformProduct[], query: string): PlatformProduct[] {
  const q = normalizeSearch(query);
  if (!q) return products;
  return products.filter((product) => {
    if (normalizeSearch(product.name).includes(q)) return true;
    return product.brands.some((brand) => {
      const brandName = normalizeSearch(brand.name);
      return brandName.includes(q) || q.includes(brandName);
    });
  });
}

type AddPlatformProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSearch?: string;
  establishmentId: string;
  onAdded: (product: EstablishmentProduct) => void;
};

export function AddPlatformProductDialog({
  open,
  onOpenChange,
  initialSearch = "",
  establishmentId,
  onAdded,
}: AddPlatformProductDialogProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialSearch);
  const [brandsProduct, setBrandsProduct] = useState<PlatformProduct | null>(null);
  const [initialBrandId, setInitialBrandId] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearch(initialSearch);
  }, [open, initialSearch]);

  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ["products", "approved", search],
    queryFn: () => fetchApprovedProducts({ name: search.trim() || undefined, status: "approved" }),
    enabled: open,
    retry: 1,
  });

  useEffect(() => {
    if (!isError) return;
    const message =
      error instanceof ApiError
        ? error.message
        : t("modules.quotation.quotations.create.toastPlatformSearchError");
    toast.error(message);
  }, [isError, error, t]);

  const filteredProducts = useMemo(
    () => filterPlatformProducts(products, search),
    [products, search],
  );

  const formattedCreateName = useMemo(() => formatProductNameTitle(search), [search]);

  function handleAddProduct(product: PlatformProduct) {
    setInitialBrandId(resolveInitialPlatformBrandId(product, search));
    setBrandsProduct(product);
  }

  return (
    <>
      <Dialog open={open && !brandsProduct} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-4 overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("modules.quotation.quotations.create.platformDialogTitle")}</DialogTitle>
          </DialogHeader>

          <div className="shrink-0 space-y-2 p-1">
            <Label htmlFor="platform-product-search">
              {t("modules.quotation.quotations.create.platformSearchLabel")}
            </Label>
            <Input
              id="platform-product-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("modules.quotation.quotations.create.platformSearchPlaceholder")}
              autoFocus
            />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
            <ScrollArea className="h-[min(40vh,320px)]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-12" />
                      <TableHead>{t("modules.quotation.quotations.create.platformTableName")}</TableHead>
                      <TableHead className="w-16 text-right">
                        {t("modules.quotation.quotations.create.platformTableActions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                          {t("modules.quotation.quotations.create.platformLoading")}
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                          {t("modules.quotation.quotations.create.platformEmpty")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <TableRow
                          key={product.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleAddProduct(product)}
                        >
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">{formatPlatformProductLabel(product)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct(product);
                              }}
                              aria-label={t("modules.quotation.quotations.create.platformAddAction")}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
          </div>

          <Button
            type="button"
            className={cn("w-full shrink-0 text-white")}
            onClick={() => setCreateOpen(true)}
          >
            {search.trim()
              ? t("modules.quotation.quotations.create.platformCreateButton", {
                  name: formattedCreateName,
                })
              : t("modules.quotation.quotations.create.platformCreateButtonGeneric")}
          </Button>

          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManagePlatformProductBrandsDialog
        open={Boolean(brandsProduct)}
        onOpenChange={(next) => {
          if (!next) {
            setBrandsProduct(null);
            setInitialBrandId(undefined);
          }
        }}
        product={brandsProduct}
        establishmentId={establishmentId}
        initialBrandId={initialBrandId}
        onAdded={(product) => {
          setBrandsProduct(null);
          onOpenChange(false);
          onAdded(product);
        }}
      />

      <CreateEstablishmentProductDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        productName={formattedCreateName}
        establishmentId={establishmentId}
        onCreated={(product) => {
          setCreateOpen(false);
          onOpenChange(false);
          onAdded(product);
        }}
      />
    </>
  );
}
