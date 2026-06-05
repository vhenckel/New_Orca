import { Filter, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { EstablishmentOption } from "@/modules/buyer/quotation/types/create-budget";
import {
  useLocationCitiesQuery,
  useLocationStatesQuery,
} from "@/modules/suppliers/hooks/useSupplierListSupportQueries";
import type { SupplierListQueryState } from "@/modules/suppliers/lib/supplier-list-filters";
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

export type SupplierFiltersDraft = Pick<
  SupplierListQueryState,
  | "responsibleName"
  | "phone"
  | "email"
  | "segmentId"
  | "establishmentId"
  | "state"
  | "city"
  | "neighborhood"
>;

interface SegmentOption {
  id: string;
  name: string;
  active?: boolean;
}

interface SupplierListFiltersProps {
  role: ApiUserRole | null;
  applied: SupplierFiltersDraft;
  segments: SegmentOption[];
  establishments: EstablishmentOption[];
  showEstablishmentFilter: boolean;
  activeCount: number;
  onApply: (draft: SupplierFiltersDraft) => void;
  onClear: () => void;
}

export function SupplierListFilters({
  role,
  applied,
  segments,
  establishments,
  showEstablishmentFilter,
  activeCount,
  onApply,
  onClear,
}: SupplierListFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(applied);

  const statesQuery = useLocationStatesQuery(open);
  const citiesQuery = useLocationCitiesQuery(draft.state, open && Boolean(draft.state));

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  useEffect(() => {
    if (!draft.state) {
      setDraft((prev) => ({ ...prev, city: "", neighborhood: "" }));
    }
  }, [draft.state]);

  useEffect(() => {
    if (!draft.city) {
      setDraft((prev) => ({ ...prev, neighborhood: "" }));
    }
  }, [draft.city]);

  const segmentOptions = useMemo(
    () => [
      { value: "", label: t("modules.suppliers.list.filter.all") },
      ...segments.map((segment) => ({
        value: segment.id,
        label:
          segment.active === false
            ? t("modules.suppliers.list.filter.inactiveSegment", { name: segment.name })
            : segment.name,
      })),
    ],
    [segments, t],
  );

  const establishmentOptions = useMemo(
    () => [
      { value: "", label: t("modules.suppliers.list.filter.all") },
      ...establishments.map((est) => ({ value: est.id, label: est.name })),
    ],
    [establishments, t],
  );

  const stateOptions = useMemo(
    () => [
      { value: "", label: t("modules.suppliers.list.filter.all") },
      ...(statesQuery.data ?? []).map((state) => ({ value: state.uf, label: state.name })),
    ],
    [statesQuery.data, t],
  );

  const cityOptions = useMemo(
    () => [
      { value: "", label: t("modules.suppliers.list.filter.all") },
      ...(citiesQuery.data ?? []).map((city) => ({ value: city.name, label: city.name })),
    ],
    [citiesQuery.data, t],
  );

  if (role !== "admin" && role !== "establishment") return null;

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Filter className="size-4" />
          {t("modules.suppliers.list.filters")}
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
          {t("modules.suppliers.list.filtersTitle")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier-filter-responsible">
            {t("modules.suppliers.list.filter.representative")}
          </Label>
          <Input
            id="supplier-filter-responsible"
            value={draft.responsibleName}
            onChange={(e) => setDraft((prev) => ({ ...prev, responsibleName: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier-filter-phone">{t("modules.suppliers.list.filter.phone")}</Label>
          <Input
            id="supplier-filter-phone"
            value={draft.phone}
            onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        {role === "admin" ? (
          <div className="space-y-2">
            <Label htmlFor="supplier-filter-email">{t("modules.suppliers.list.filter.email")}</Label>
            <Input
              id="supplier-filter-email"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
        ) : null}

        {showEstablishmentFilter ? (
          <div className="space-y-2">
            <Label>{t("modules.suppliers.list.filter.establishment")}</Label>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {establishmentOptions.map((opt) => (
                  <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>{t("modules.suppliers.list.filter.segment")}</Label>
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {segmentOptions.map((opt) => (
                <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("modules.suppliers.list.filter.state")}</Label>
          <Select
            value={draft.state || "__all__"}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                state: value === "__all__" ? "" : value,
                city: "",
                neighborhood: "",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stateOptions.map((opt) => (
                <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("modules.suppliers.list.filter.city")}</Label>
          <Select
            value={draft.city || "__all__"}
            disabled={!draft.state}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                city: value === "__all__" ? "" : value,
                neighborhood: "",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((opt) => (
                <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier-filter-neighborhood">
            {t("modules.suppliers.list.filter.neighborhood")}
          </Label>
          <Input
            id="supplier-filter-neighborhood"
            disabled={!draft.city}
            value={draft.neighborhood}
            onChange={(e) => setDraft((prev) => ({ ...prev, neighborhood: e.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            {t("modules.suppliers.list.clearFilters")}
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            {t("modules.suppliers.list.applyFilters")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
