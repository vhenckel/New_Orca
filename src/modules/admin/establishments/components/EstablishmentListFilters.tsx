import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { EstablishmentListQueryState } from "@/modules/admin/establishments/lib/establishment-list-filters";
import {
  useLocationCitiesQuery,
  useLocationStatesQuery,
} from "@/modules/suppliers/hooks/useSupplierListSupportQueries";
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

export type EstablishmentFiltersDraft = Pick<
  EstablishmentListQueryState,
  | "responsibleName"
  | "phone"
  | "addressState"
  | "addressCity"
  | "addressNeighborhood"
  | "status"
  | "active"
>;

interface EstablishmentListFiltersProps {
  applied: EstablishmentFiltersDraft;
  activeCount: number;
  onApply: (draft: EstablishmentFiltersDraft) => void;
  onClear: () => void;
}

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "late_payment", "canceled"] as const;

export function EstablishmentListFilters({
  applied,
  activeCount,
  onApply,
  onClear,
}: EstablishmentListFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(applied);

  const statesQuery = useLocationStatesQuery(open);
  const citiesQuery = useLocationCitiesQuery(draft.addressState, open && Boolean(draft.addressState));

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  useEffect(() => {
    if (!draft.addressState) {
      setDraft((prev) => ({ ...prev, addressCity: "", addressNeighborhood: "" }));
    }
  }, [draft.addressState]);

  useEffect(() => {
    if (!draft.addressCity) {
      setDraft((prev) => ({ ...prev, addressNeighborhood: "" }));
    }
  }, [draft.addressCity]);

  const stateOptions = useMemo(
    () => [
      { value: "", label: t("modules.admin.establishments.list.filter.all") },
      ...(statesQuery.data ?? []).map((state) => ({ value: state.uf, label: state.name })),
    ],
    [statesQuery.data, t],
  );

  const cityOptions = useMemo(
    () => [
      { value: "", label: t("modules.admin.establishments.list.filter.all") },
      ...(citiesQuery.data ?? []).map((city) => ({ value: city.name, label: city.name })),
    ],
    [citiesQuery.data, t],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <SlidersHorizontal className="size-4" />
          {t("modules.admin.establishments.list.advancedFilters")}
          {activeCount > 0 ? (
            <Badge variant="secondary" className="rounded-full px-2">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">{t("modules.admin.establishments.list.filtersTitle")}</p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="est-filter-responsible">
              {t("modules.admin.establishments.list.filter.responsible")}
            </Label>
            <Input
              id="est-filter-responsible"
              value={draft.responsibleName}
              onChange={(e) => setDraft((prev) => ({ ...prev, responsibleName: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="est-filter-phone">{t("modules.admin.establishments.list.filter.phone")}</Label>
            <Input
              id="est-filter-phone"
              value={draft.phone}
              onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("modules.admin.establishments.list.filter.state")}</Label>
            <Select
              value={draft.addressState || "__all__"}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  addressState: value === "__all__" ? "" : value,
                  addressCity: "",
                  addressNeighborhood: "",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((option) => (
                  <SelectItem key={option.value || "__all__"} value={option.value || "__all__"}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("modules.admin.establishments.list.filter.city")}</Label>
            <Select
              value={draft.addressCity || "__all__"}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  addressCity: value === "__all__" ? "" : value,
                  addressNeighborhood: "",
                }))
              }
              disabled={!draft.addressState}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((option) => (
                  <SelectItem key={option.value || "__all__"} value={option.value || "__all__"}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="est-filter-neighborhood">
              {t("modules.admin.establishments.list.filter.neighborhood")}
            </Label>
            <Input
              id="est-filter-neighborhood"
              value={draft.addressNeighborhood}
              disabled={!draft.addressCity}
              onChange={(e) => setDraft((prev) => ({ ...prev, addressNeighborhood: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("modules.admin.establishments.list.filter.paymentStatus")}</Label>
            <Select
              value={draft.status || "__all__"}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, status: value === "__all__" ? "" : value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("modules.admin.establishments.list.filter.all")}</SelectItem>
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`modules.admin.establishments.status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("modules.admin.establishments.list.filter.active")}</Label>
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
                <SelectItem value="__all__">{t("modules.admin.establishments.list.filter.all")}</SelectItem>
                <SelectItem value="true">{t("modules.admin.establishments.list.active.yes")}</SelectItem>
                <SelectItem value="false">{t("modules.admin.establishments.list.active.no")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              {t("modules.admin.establishments.list.clearFilters")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              {t("modules.admin.establishments.list.filter.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
