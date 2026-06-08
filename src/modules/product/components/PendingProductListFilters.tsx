import { Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import type { SegmentOption } from "@/modules/buyer/quotation/api/segments-api";
import type { EstablishmentOption } from "@/modules/buyer/quotation/types/create-budget";
import type { PendingProductListQueryState } from "@/modules/product/lib/pending-product-list-filters";
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

export type PendingProductFiltersDraft = Pick<
  PendingProductListQueryState,
  "status" | "type" | "establishmentId" | "segmentId"
>;

interface PendingProductListFiltersProps {
  applied: PendingProductFiltersDraft;
  segments: SegmentOption[];
  establishments: EstablishmentOption[];
  activeCount: number;
  onApply: (draft: PendingProductFiltersDraft) => void;
  onClear: () => void;
}

export function PendingProductListFilters({
  applied,
  segments,
  establishments,
  activeCount,
  onApply,
  onClear,
}: PendingProductListFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Filter className="size-4" />
          {t("modules.product.pending.list.filters")}
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
          {t("modules.product.pending.list.filtersTitle")}
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("modules.product.pending.list.filter.status")}</Label>
          <Select
            value={draft.status || "pending"}
            onValueChange={(value) => setDraft((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                {t("modules.product.pending.status.pending")}
              </SelectItem>
              <SelectItem value="approved">
                {t("modules.product.pending.status.approved")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("modules.product.pending.status.rejected")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("modules.product.pending.list.filter.type")}</Label>
          <Select
            value={draft.type || "__all__"}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, type: value === "__all__" ? "" : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("modules.product.list.filter.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("modules.product.list.filter.all")}</SelectItem>
              <SelectItem value="product_creation">
                {t("modules.product.pending.type.product")}
              </SelectItem>
              <SelectItem value="brand_addition">
                {t("modules.product.pending.type.brand")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("modules.product.pending.list.filter.establishment")}</Label>
          <Select
            value={draft.establishmentId || "__all__"}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                establishmentId: value === "__all__" ? "" : value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("modules.product.list.filter.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("modules.product.list.filter.all")}</SelectItem>
              {establishments.map((est) => (
                <SelectItem key={est.id} value={est.id}>
                  {est.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("modules.product.pending.list.filter.segment")}</Label>
          <Select
            value={draft.segmentId || "__all__"}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                segmentId: value === "__all__" ? "" : value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("modules.product.list.filter.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("modules.product.list.filter.all")}</SelectItem>
              {segments.map((segment) => (
                <SelectItem key={segment.id} value={segment.id}>
                  {segment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            {t("modules.product.list.clearFilters")}
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            {t("modules.product.list.applyFilters")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
