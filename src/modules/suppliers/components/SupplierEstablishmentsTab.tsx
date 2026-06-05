import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { searchEstablishments } from "@/modules/suppliers/api/suppliers-api";
import type { SupplierLinkedEstablishment } from "@/modules/suppliers/types/supplier-detail";
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

interface SupplierEstablishmentsTabProps {
  establishments: SupplierLinkedEstablishment[];
  readOnly: boolean;
  onLink?: (establishmentId: string) => void;
  onUnlink?: (establishmentId: string) => void;
  isLinking?: boolean;
  isUnlinking?: boolean;
}

export function SupplierEstablishmentsTab({
  establishments,
  readOnly,
  onLink,
  onUnlink,
  isLinking,
  isUnlinking,
}: SupplierEstablishmentsTabProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchQuery = useQuery({
    queryKey: ["establishments", "search", search],
    queryFn: () => searchEstablishments(search),
    enabled: open,
  });

  const linkedIds = useMemo(() => new Set(establishments.map((e) => e.id)), [establishments]);

  const options = (searchQuery.data ?? []).filter((item) => !linkedIds.has(item.id));

  return (
    <div className="flex flex-col gap-4">
      {!readOnly ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="w-fit">
              {t("modules.suppliers.form.establishments.link")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t("modules.suppliers.form.establishments.search")}
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
                    <CommandEmpty>{t("modules.suppliers.form.establishments.emptySearch")}</CommandEmpty>
                    <CommandGroup>
                      {options.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => {
                            onLink?.(item.id);
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
      ) : null}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("modules.suppliers.form.establishments.name")}</TableHead>
              <TableHead>{t("modules.suppliers.form.establishments.city")}</TableHead>
              <TableHead>{t("modules.suppliers.form.establishments.neighborhood")}</TableHead>
              {!readOnly ? <TableHead className="w-16" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {establishments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={readOnly ? 3 : 4}
                  className="h-16 text-center text-muted-foreground"
                >
                  {t("modules.suppliers.form.establishments.empty")}
                </TableCell>
              </TableRow>
            ) : (
              establishments.map((est) => (
                <TableRow key={est.id}>
                  <TableCell className="font-medium">{est.name}</TableCell>
                  <TableCell>{est.address?.city ?? "—"}</TableCell>
                  <TableCell>{est.address?.neighborhood ?? "—"}</TableCell>
                  {!readOnly ? (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        disabled={isUnlinking}
                        onClick={() => onUnlink?.(est.id)}
                        aria-label={t("modules.suppliers.form.establishments.unlink")}
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

      {isLinking ? (
        <p className="text-sm text-muted-foreground">
          {t("modules.suppliers.form.establishments.linking")}
        </p>
      ) : null}
    </div>
  );
}
