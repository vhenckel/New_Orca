import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { SupplierCompanySupplierSummary } from "@/modules/admin/supplier-companies/types";
import { searchSuppliers } from "@/modules/suppliers/api/suppliers-api";
import { formatSupplierPhone } from "@/modules/suppliers/lib/supplier-list-display";
import type { SupplierSearchResult } from "@/modules/suppliers/types/supplier-detail";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
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

interface SupplierPickerFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
  selectedSuppliers?: SupplierCompanySupplierSummary[];
}

function formatSupplierLabel(item: SupplierSearchResult | SupplierCompanySupplierSummary): string {
  if ("responsibleName" in item) {
    return `${item.name} (${item.responsibleName})`;
  }
  return item.name;
}

export function SupplierPickerField({
  value,
  onChange,
  selectedSuppliers = [],
}: SupplierPickerFieldProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchQuery = useQuery({
    queryKey: ["suppliers", "search", search],
    queryFn: () => searchSuppliers(search),
    enabled: open,
  });

  const selectedLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const supplier of selectedSuppliers) {
      map.set(supplier.id, formatSupplierLabel(supplier));
    }
    for (const item of searchQuery.data ?? []) {
      if (value.includes(item.id)) {
        map.set(item.id, `${formatSupplierPhone(item.phone)} - ${item.name} (${item.responsibleName})`);
      }
    }
    return value.map((id) => ({ id, label: map.get(id) ?? id }));
  }, [searchQuery.data, selectedSuppliers, value]);

  const options = useMemo(() => {
    const seen = new Set<string>();
    const merged: Array<{ id: string; label: string }> = [];
    for (const supplier of selectedSuppliers) {
      if (!seen.has(supplier.id)) {
        seen.add(supplier.id);
        merged.push({ id: supplier.id, label: formatSupplierLabel(supplier) });
      }
    }
    for (const item of searchQuery.data ?? []) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push({
          id: item.id,
          label: `${formatSupplierPhone(item.phone)} - ${item.name} (${item.responsibleName})`,
        });
      }
    }
    return merged;
  }, [searchQuery.data, selectedSuppliers]);

  const toggleSupplier = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }
    onChange([...value, id]);
  };

  const removeSupplier = (id: string) => {
    onChange(value.filter((item) => item !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {selectedLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1 pr-1">
              {item.label}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-muted"
                onClick={() => removeSupplier(item.id)}
                aria-label={t("modules.admin.supplierCompanies.form.removeSupplier")}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal"
          >
            {t("modules.admin.supplierCompanies.form.suppliersPlaceholder")}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={t("modules.admin.supplierCompanies.form.suppliersSearch")}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{t("modules.admin.supplierCompanies.form.suppliersEmpty")}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={() => toggleSupplier(option.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value.includes(option.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
