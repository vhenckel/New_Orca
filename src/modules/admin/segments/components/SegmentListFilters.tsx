import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import type { SegmentListQueryState } from "@/modules/admin/segments/lib/segment-list-filters";
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

export type SegmentFiltersDraft = Pick<SegmentListQueryState, "active">;

interface SegmentListFiltersProps {
  applied: SegmentFiltersDraft;
  activeCount: number;
  onApply: (draft: SegmentFiltersDraft) => void;
  onClear: () => void;
}

export function SegmentListFilters({
  applied,
  activeCount,
  onApply,
  onClear,
}: SegmentListFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <SlidersHorizontal className="size-4" />
          {t("modules.admin.segments.list.filters")}
          {activeCount > 0 ? (
            <Badge variant="secondary" className="rounded-full px-2">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">{t("modules.admin.segments.list.filtersTitle")}</p>

          <div className="flex flex-col gap-2">
            <Label>{t("modules.admin.segments.list.filter.active")}</Label>
            <Select
              value={draft.active || "__all__"}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, active: value === "__all__" ? "" : value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("modules.admin.segments.list.filter.all")}</SelectItem>
                <SelectItem value="true">{t("modules.admin.segments.list.active.yes")}</SelectItem>
                <SelectItem value="false">{t("modules.admin.segments.list.active.no")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              {t("modules.admin.segments.list.clearFilters")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              {t("modules.admin.segments.list.filter.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
