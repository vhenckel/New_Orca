import { Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import {
  BUDGET_FILTER_STATUS_OPTIONS,
  type BudgetEstablishment,
} from "@/modules/buyer/quotation/types/budget";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export interface BudgetListFiltersDraft {
  status: string;
  establishmentId: string;
}

interface BudgetListFiltersProps {
  applied: BudgetListFiltersDraft;
  establishments: BudgetEstablishment[];
  showEstablishmentFilter: boolean;
  activeCount: number;
  onApply: (draft: BudgetListFiltersDraft) => void;
  onClear: () => void;
}

export function BudgetListFilters({
  applied,
  establishments,
  showEstablishmentFilter,
  activeCount,
  onApply,
  onClear,
}: BudgetListFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<BudgetListFiltersDraft>(applied);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="gap-2">
            <Filter className="size-4" />
            {t("modules.quotation.quotations.advancedFilters")}
            {activeCount > 0 ? (
              <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                {activeCount}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[320px] space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            {t("modules.quotation.quotations.filtersTitle")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-filter-status">{t("modules.quotation.quotations.statusFilterLabel")}</Label>
            <Select
              value={draft.status || "all"}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, status: value === "all" ? "" : value }))
              }
            >
              <SelectTrigger id="budget-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("modules.quotation.quotations.statusAll")}</SelectItem>
                {BUDGET_FILTER_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`modules.quotation.quotations.status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showEstablishmentFilter && establishments.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="budget-filter-establishment">
                {t("modules.quotation.quotations.filters.establishment")}
              </Label>
              <Select
                value={draft.establishmentId || "all"}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    establishmentId: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger id="budget-filter-establishment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("modules.quotation.quotations.statusAll")}</SelectItem>
                  {establishments.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDraft((prev) => ({ ...prev, status: "" }))}
            >
              {t("modules.quotation.quotations.clearStatusFilters")}
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              {t("modules.quotation.quotations.filters.apply")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={activeCount === 0}>
        {t("modules.quotation.quotations.clearFilters")}
      </Button>
    </div>
  );
}
