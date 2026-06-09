import { Search } from "lucide-react";

import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface SupplierCompanyListFiltersProps {
  name: string;
  activeFilterCount: number;
  onNameChange: (value: string) => void;
  onClear: () => void;
}

export function SupplierCompanyListFilters({
  name,
  activeFilterCount,
  onNameChange,
  onClear,
}: SupplierCompanyListFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t("modules.admin.supplierCompanies.list.searchPlaceholder")}
          className="pl-9"
        />
      </div>
      {activeFilterCount > 0 ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          {t("modules.admin.supplierCompanies.list.clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}
