import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { fetchSuppliersPage } from "@/modules/suppliers/api/suppliers-api";
import { formatSupplierPhone } from "@/modules/suppliers/lib/supplier-list-display";
import { useI18n } from "@/shared/i18n/useI18n";
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

interface EstablishmentSuppliersTabProps {
  establishmentId: string;
  onLink: (supplierId: string) => void;
  onUnlink: (supplierId: string) => void;
  isLinking?: boolean;
  isUnlinking?: boolean;
}

export function EstablishmentSuppliersTab({
  establishmentId,
  onLink,
  onUnlink,
  isLinking,
  isUnlinking,
}: EstablishmentSuppliersTabProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const listQuery = useQuery({
    queryKey: ["suppliers", "establishment", establishmentId],
    queryFn: () =>
      fetchSuppliersPage({
        page: 1,
        totalPerPage: 100,
        establishmentId,
        sort: "name",
        order: "ASC",
      }),
  });

  const searchQuery = useQuery({
    queryKey: ["suppliers", "search", search],
    queryFn: () =>
      fetchSuppliersPage({
        page: 1,
        totalPerPage: 25,
        name: search,
        sort: "name",
        order: "ASC",
      }),
    enabled: open,
  });

  const linkedSuppliers = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);
  const linkedIds = useMemo(() => new Set(linkedSuppliers.map((s) => s.id)), [linkedSuppliers]);
  const options = (searchQuery.data?.data ?? []).filter((item) => !linkedIds.has(item.id));

  return (
    <div className="flex flex-col gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-fit">
            {t("modules.admin.establishments.suppliers.link")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={t("modules.admin.establishments.suppliers.search")}
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
                  <CommandEmpty>{t("modules.admin.establishments.suppliers.emptySearch")}</CommandEmpty>
                  <CommandGroup>
                    {options.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => {
                          onLink(item.id);
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

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t("modules.admin.establishments.suppliers.company")}</TableHead>
              <TableHead>{t("modules.admin.establishments.suppliers.representative")}</TableHead>
              <TableHead>{t("modules.admin.establishments.suppliers.phone")}</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                  {t("modules.admin.establishments.suppliers.loading")}
                </TableCell>
              </TableRow>
            ) : linkedSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                  {t("modules.admin.establishments.suppliers.empty")}
                </TableCell>
              </TableRow>
            ) : (
              linkedSuppliers.map((supplier, index) => (
                <TableRow key={supplier.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.responsibleName}</TableCell>
                  <TableCell>{formatSupplierPhone(supplier.phone)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      disabled={isUnlinking}
                      onClick={() => onUnlink(supplier.id)}
                      aria-label={t("modules.admin.establishments.suppliers.unlink")}
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

      {isLinking ? (
        <p className="text-sm text-muted-foreground">{t("modules.admin.establishments.suppliers.linking")}</p>
      ) : null}
    </div>
  );
}
