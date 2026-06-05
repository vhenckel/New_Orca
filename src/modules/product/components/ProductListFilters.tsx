import { Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import type { SegmentOption } from "@/modules/buyer/quotation/api/segments-api";
import type { EstablishmentOption } from "@/modules/buyer/quotation/types/create-budget";
import type {
  AdminProductListQueryState,
  EstablishmentProductListQueryState,
} from "@/modules/product/lib/product-list-filters";
import type { ApiUserRole } from "@/shared/auth/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export type AdminProductFiltersDraft = Pick<
  AdminProductListQueryState,
  "brand" | "weight" | "segmentId"
>;

export type EstablishmentProductFiltersDraft = Pick<
  EstablishmentProductListQueryState,
  "establishmentId"
>;

interface ProductListFiltersProps {
  role: ApiUserRole | null;
  adminApplied: AdminProductFiltersDraft;
  establishmentApplied: EstablishmentProductFiltersDraft;
  segments: SegmentOption[];
  establishments: EstablishmentOption[];
  showEstablishmentFilter: boolean;
  activeCount: number;
  onApplyAdmin: (draft: AdminProductFiltersDraft) => void;
  onApplyEstablishment: (draft: EstablishmentProductFiltersDraft) => void;
  onClear: () => void;
}

export function ProductListFilters({
  role,
  adminApplied,
  establishmentApplied,
  segments,
  establishments,
  showEstablishmentFilter,
  activeCount,
  onApplyAdmin,
  onApplyEstablishment,
  onClear,
}: ProductListFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [adminDraft, setAdminDraft] = useState(adminApplied);
  const [establishmentDraft, setEstablishmentDraft] = useState(establishmentApplied);

  useEffect(() => {
    if (open) {
      setAdminDraft(adminApplied);
      setEstablishmentDraft(establishmentApplied);
    }
  }, [open, adminApplied, establishmentApplied]);

  const handleApply = () => {
    if (role === "admin") {
      onApplyAdmin(adminDraft);
    } else {
      onApplyEstablishment(establishmentDraft);
    }
    setOpen(false);
  };

  if (role !== "admin" && role !== "establishment") return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Filter className="size-4" />
          {t("modules.product.list.filters")}
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
          {t("modules.product.list.filtersTitle")}
        </div>

        {role === "admin" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="product-filter-brand">{t("modules.product.list.filter.brand")}</Label>
              <Input
                id="product-filter-brand"
                value={adminDraft.brand}
                onChange={(e) => setAdminDraft((prev) => ({ ...prev, brand: e.target.value }))}
                placeholder={t("modules.product.list.filter.brandPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-filter-weight">{t("modules.product.list.filter.weight")}</Label>
              <Input
                id="product-filter-weight"
                inputMode="decimal"
                value={adminDraft.weight}
                onChange={(e) => setAdminDraft((prev) => ({ ...prev, weight: e.target.value }))}
                placeholder={t("modules.product.list.filter.weightPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-filter-segment">{t("modules.product.list.filter.segment")}</Label>
              <Select
                value={adminDraft.segmentId || "all"}
                onValueChange={(value) =>
                  setAdminDraft((prev) => ({
                    ...prev,
                    segmentId: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger id="product-filter-segment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("modules.product.list.filter.all")}</SelectItem>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : null}

        {role === "establishment" && showEstablishmentFilter && establishments.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="product-filter-establishment">
              {t("modules.product.list.filter.establishment")}
            </Label>
            <Select
              value={establishmentDraft.establishmentId || "all"}
              onValueChange={(value) =>
                setEstablishmentDraft((prev) => ({
                  ...prev,
                  establishmentId: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger id="product-filter-establishment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("modules.product.list.filter.all")}</SelectItem>
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
