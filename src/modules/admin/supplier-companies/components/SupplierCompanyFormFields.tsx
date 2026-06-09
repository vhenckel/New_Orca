import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { SupplierPickerField } from "@/modules/admin/supplier-companies/components/SupplierPickerField";
import type { SupplierCompanyFormSchemaValues } from "@/modules/admin/supplier-companies/lib/supplier-company-form-schema";
import type { SupplierCompanySupplierSummary } from "@/modules/admin/supplier-companies/types";
import type { SegmentOption } from "@/modules/buyer/quotation/api/segments-api";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Field, FieldContent, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Switch } from "@/shared/ui/switch";

interface SupplierCompanyFormFieldsProps {
  form: UseFormReturn<
    Omit<SupplierCompanyFormSchemaValues, "minimumOrderValue"> & { minimumOrderValue: string }
  >;
  segments: SegmentOption[];
  selectedSuppliers?: SupplierCompanySupplierSummary[];
}

export function SupplierCompanyFormFields({
  form,
  segments,
  selectedSuppliers = [],
}: SupplierCompanyFormFieldsProps) {
  const { t } = useI18n();
  const [segmentsOpen, setSegmentsOpen] = useState(false);
  const segmentIds = form.watch("segmentIds");
  const supplierIds = form.watch("supplierIds");

  const selectedSegmentLabels = useMemo(
    () =>
      segmentIds
        .map((id) => segments.find((s) => s.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [segmentIds, segments],
  );

  const toggleSegment = (id: string) => {
    const current = form.getValues("segmentIds");
    if (current.includes(id)) {
      form.setValue(
        "segmentIds",
        current.filter((item) => item !== id),
        { shouldDirty: true, shouldValidate: true },
      );
      return;
    }
    form.setValue("segmentIds", [...current, id], { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="company-name">{t("modules.admin.supplierCompanies.form.name")}</FieldLabel>
        <FieldContent>
          <Input id="company-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="company-minimum-order">
          {t("modules.admin.supplierCompanies.form.minimumOrder")}
        </FieldLabel>
        <FieldContent>
          <Input id="company-minimum-order" placeholder="0,00" {...form.register("minimumOrderValue")} />
          <FieldError errors={[form.formState.errors.minimumOrderValue]} />
        </FieldContent>
      </Field>

      <div className="space-y-2 md:col-span-2">
        <Label>{t("modules.admin.supplierCompanies.form.segments")}</Label>
        <Popover open={segmentsOpen} onOpenChange={setSegmentsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal"
            >
              {selectedSegmentLabels.length > 0
                ? t("modules.admin.supplierCompanies.form.segmentsSelected", {
                    count: selectedSegmentLabels.length,
                  })
                : t("modules.admin.supplierCompanies.form.segmentsPlaceholder")}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder={t("modules.admin.supplierCompanies.form.segmentsSearch")} />
              <CommandList>
                <CommandEmpty>{t("modules.admin.supplierCompanies.form.segmentsEmpty")}</CommandEmpty>
                <CommandGroup>
                  {segments.map((segment) => (
                    <CommandItem
                      key={segment.id}
                      value={segment.name}
                      onSelect={() => toggleSegment(segment.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          segmentIds.includes(segment.id) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {segment.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>{t("modules.admin.supplierCompanies.form.suppliers")}</Label>
        <SupplierPickerField
          value={supplierIds}
          onChange={(next) =>
            form.setValue("supplierIds", next, { shouldDirty: true, shouldValidate: true })
          }
          selectedSuppliers={selectedSuppliers}
        />
      </div>

      <div className="flex items-center gap-3 md:col-span-2">
        <Switch
          id="company-customization"
          checked={form.watch("allowSupplierMinimumOrderCustomization")}
          onCheckedChange={(checked) =>
            form.setValue("allowSupplierMinimumOrderCustomization", checked, {
              shouldDirty: true,
            })
          }
        />
        <Label htmlFor="company-customization">
          {t("modules.admin.supplierCompanies.form.allowCustomization")}
        </Label>
      </div>
    </div>
  );
}
