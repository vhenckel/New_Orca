import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Tags, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchAvailableEstablishmentProducts } from "@/modules/admin/establishments/api/establishments-api";
import { AddProductWithBrandsDialog } from "@/modules/admin/establishments/components/AddProductWithBrandsDialog";
import { deleteFromEstablishment } from "@/modules/product/api/establishment-products-api";
import { useEstablishmentProductsInfiniteQuery } from "@/modules/product/hooks/useEstablishmentProductsInfiniteQuery";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { toast } from "@/shared/ui/sonner";

interface EstablishmentProductsTabProps {
  establishmentId: string;
}

export function EstablishmentProductsTab({ establishmentId }: EstablishmentProductsTabProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [brandsDialogOpen, setBrandsDialogOpen] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const listQuery = useEstablishmentProductsInfiniteQuery({
    establishmentId,
    sort: "name",
    order: "ASC",
    totalPerPage: 15,
  });

  const searchQuery = useQuery({
    queryKey: ["establishment-products", "available", search],
    queryFn: () => fetchAvailableEstablishmentProducts({ name: search }),
    enabled: open,
  });

  const rows = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [listQuery.data],
  );

  const linkedProductIds = useMemo(() => new Set(rows.map((row) => row.productId)), [rows]);
  const options = (searchQuery.data?.data ?? []).filter((item) => !linkedProductIds.has(item.id));

  const handleAdd = () => {
    if (!selectedProduct) return;
    setBrandsDialogOpen(true);
  };

  const handleUnlink = async (establishmentProductId: string) => {
    setUnlinkingId(establishmentProductId);
    try {
      await deleteFromEstablishment(establishmentProductId, establishmentId);
      toast.success(t("modules.admin.establishments.products.toast.unlinkSuccess"));
      await listQuery.refetch();
    } catch {
      toast.error(t("modules.admin.establishments.products.toast.unlinkError"));
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="min-w-[240px] justify-start">
              {selectedProduct?.name ?? t("modules.admin.establishments.products.selectProduct")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t("modules.admin.establishments.products.search")}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {searchQuery.isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>{t("modules.admin.establishments.products.emptySearch")}</CommandEmpty>
                    <CommandGroup>
                      {options.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => {
                            setSelectedProduct({ id: item.id, name: item.name });
                            setOpen(false);
                            setSearch("");
                          }}
                        >
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button type="button" disabled={!selectedProduct} onClick={handleAdd}>
          {t("modules.admin.establishments.products.add")}
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t("modules.admin.establishments.products.name")}</TableHead>
              <TableHead>{t("modules.admin.establishments.products.unit")}</TableHead>
              <TableHead>{t("modules.admin.establishments.products.brands")}</TableHead>
              <TableHead>{t("modules.admin.establishments.products.segments")}</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                  {t("modules.admin.establishments.products.loading")}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                  {t("modules.admin.establishments.products.empty")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const isApproved = row.status === "approved";
                return (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {row.name}
                        {!isApproved ? (
                          <Badge variant="outline">{row.status}</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{row.unitType}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(row.brands ?? []).map((brand) => (
                          <Badge key={brand.id} variant="secondary">
                            {brand.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(row.segments ?? []).map((segment) => (
                          <Badge key={segment.id} variant="outline">
                            {segment.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={!isApproved}
                          onClick={() =>
                            navigate(`/products/manage-brands/${establishmentId}`, {
                              state: {
                                productId: row.productId,
                                establishmentId,
                                productName: row.name,
                                returnTo: `/estabelecimentos/editar-estabelecimento/${establishmentId}`,
                              },
                            })
                          }
                          aria-label={t("modules.admin.establishments.products.manageBrands")}
                        >
                          <Tags className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          disabled={!isApproved || unlinkingId === row.establishmentProductId}
                          onClick={() => void handleUnlink(row.establishmentProductId)}
                          aria-label={t("modules.admin.establishments.products.unlink")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedProduct ? (
        <AddProductWithBrandsDialog
          open={brandsDialogOpen}
          onOpenChange={setBrandsDialogOpen}
          establishmentId={establishmentId}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          onSuccess={() => {
            setSelectedProduct(null);
            void listQuery.refetch();
          }}
        />
      ) : null}
    </div>
  );
}
