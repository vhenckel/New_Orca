import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  useLocationCitiesQuery,
  useLocationStatesQuery,
} from "@/modules/suppliers/hooks/useSupplierListSupportQueries";
import type { SupplierServiceArea } from "@/modules/suppliers/types/supplier-detail";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface SupplierServiceAreasSectionProps {
  areas: SupplierServiceArea[];
  readOnly: boolean;
  onChange?: (areas: SupplierServiceArea[]) => void;
}

const ALL_VALUE = "Todos";

export function SupplierServiceAreasSection({
  areas,
  readOnly,
  onChange,
}: SupplierServiceAreasSectionProps) {
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<SupplierServiceArea>({
    state: "",
    city: "",
    neighborhood: "",
  });

  const statesQuery = useLocationStatesQuery(dialogOpen);
  const citiesQuery = useLocationCitiesQuery(draft.state, dialogOpen && Boolean(draft.state));

  const handleAdd = () => {
    const area: SupplierServiceArea = {
      state: draft.state.trim() || ALL_VALUE,
      city: draft.city.trim() || ALL_VALUE,
      neighborhood: draft.neighborhood.trim() || ALL_VALUE,
    };
    onChange?.([...areas, area]);
    setDraft({ state: "", city: "", neighborhood: "" });
    setDialogOpen(false);
  };

  const handleRemove = (index: number) => {
    onChange?.(areas.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{t("modules.suppliers.form.serviceAreas.title")}</h3>
        {!readOnly ? (
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            {t("modules.suppliers.form.serviceAreas.add")}
          </Button>
        ) : null}
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("modules.suppliers.form.serviceAreas.state")}</TableHead>
              <TableHead>{t("modules.suppliers.form.serviceAreas.city")}</TableHead>
              <TableHead>{t("modules.suppliers.form.serviceAreas.neighborhood")}</TableHead>
              {!readOnly ? <TableHead className="w-16" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={readOnly ? 3 : 4}
                  className="h-16 text-center text-muted-foreground"
                >
                  {t("modules.suppliers.form.serviceAreas.empty")}
                </TableCell>
              </TableRow>
            ) : (
              areas.map((area, index) => (
                <TableRow key={`${area.state}-${area.city}-${area.neighborhood}-${index}`}>
                  <TableCell>{area.state}</TableCell>
                  <TableCell>{area.city}</TableCell>
                  <TableCell>{area.neighborhood}</TableCell>
                  {!readOnly ? (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(index)}
                        aria-label={t("modules.suppliers.form.serviceAreas.remove")}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.suppliers.form.serviceAreas.addTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>{t("modules.suppliers.form.serviceAreas.state")}</Label>
              <Select
                value={draft.state || "__none__"}
                onValueChange={(value) =>
                  setDraft({ state: value === "__none__" ? "" : value, city: "", neighborhood: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("modules.suppliers.list.filter.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("modules.suppliers.list.filter.all")}</SelectItem>
                  {(statesQuery.data ?? []).map((state) => (
                    <SelectItem key={state.uf} value={state.uf}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("modules.suppliers.form.serviceAreas.city")}</Label>
              <Select
                value={draft.city || "__none__"}
                disabled={!draft.state}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    city: value === "__none__" ? "" : value,
                    neighborhood: "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("modules.suppliers.list.filter.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("modules.suppliers.list.filter.all")}</SelectItem>
                  {(citiesQuery.data ?? []).map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-area-neighborhood">
                {t("modules.suppliers.form.serviceAreas.neighborhood")}
              </Label>
              <Input
                id="service-area-neighborhood"
                disabled={!draft.city}
                value={draft.neighborhood}
                onChange={(e) => setDraft((prev) => ({ ...prev, neighborhood: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {t("modules.suppliers.form.cancel")}
            </Button>
            <Button type="button" onClick={handleAdd}>
              {t("modules.suppliers.form.serviceAreas.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
