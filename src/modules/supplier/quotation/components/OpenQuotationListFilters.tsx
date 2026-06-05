import { Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { OPEN_QUOTATION_FILTER_STATUS } from "@/modules/supplier/quotation/types/open-quotation";
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

interface OpenQuotationListFiltersProps {
  appliedStatus: string;
  activeCount: number;
  onApply: (status: string) => void;
  onClear: () => void;
}

export function OpenQuotationListFilters({
  appliedStatus,
  activeCount,
  onApply,
  onClear,
}: OpenQuotationListFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(appliedStatus);

  useEffect(() => {
    if (open) setDraftStatus(appliedStatus);
  }, [open, appliedStatus]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="gap-2">
            <Filter className="size-4" />
            {t("modules.supplierPortal.quotation.list.advancedFilters")}
            {activeCount > 0 ? (
              <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                {activeCount}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[300px] space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            {t("modules.supplierPortal.quotation.list.filtersTitle")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="open-quotation-status">
              {t("modules.supplierPortal.quotation.list.statusFilterLabel")}
            </Label>
            <Select
              value={draftStatus || "all"}
              onValueChange={(value) => setDraftStatus(value === "all" ? "" : value)}
            >
              <SelectTrigger id="open-quotation-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("modules.supplierPortal.quotation.list.statusAll")}</SelectItem>
                {OPEN_QUOTATION_FILTER_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`modules.supplierPortal.quotation.list.status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setDraftStatus("")}>
              {t("modules.supplierPortal.quotation.list.clearStatusFilters")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply(draftStatus);
                setOpen(false);
              }}
            >
              {t("modules.supplierPortal.quotation.list.filters.apply")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={activeCount === 0}>
        {t("modules.supplierPortal.quotation.list.clearFilters")}
      </Button>
    </div>
  );
}
