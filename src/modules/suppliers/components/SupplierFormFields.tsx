import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { SegmentOption } from "@/modules/buyer/quotation/api/segments-api";
import type { SupplierFormSchemaValues } from "@/modules/suppliers/lib/supplier-form-schema";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface SupplierFormFieldsProps {
  form: UseFormReturn<SupplierFormSchemaValues>;
  segments: SegmentOption[];
  readOnly: boolean;
}

export function SupplierFormFields({ form, segments, readOnly }: SupplierFormFieldsProps) {
  const { t } = useI18n();
  const [segmentsOpen, setSegmentsOpen] = useState(false);
  const segmentIds = form.watch("segmentIds");

  const selectedLabels = useMemo(
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
    } else {
      form.setValue("segmentIds", [...current, id], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const field = (
    name: keyof SupplierFormSchemaValues,
    label: string,
    options?: { type?: string; placeholder?: string },
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`supplier-${name}`}>{label}</Label>
      <Input
        id={`supplier-${name}`}
        type={options?.type}
        placeholder={options?.placeholder}
        readOnly={readOnly}
        disabled={readOnly}
        {...form.register(name)}
      />
      {form.formState.errors[name] ? (
        <p className="text-sm text-destructive">
          {String(form.formState.errors[name]?.message ?? "")}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {field("name", t("modules.suppliers.form.name"))}
      {field("responsibleName", t("modules.suppliers.form.responsibleName"))}
      {field("phone", t("modules.suppliers.form.phone"), { type: "tel" })}
      {field("responsibleEmail", t("modules.suppliers.form.email"), { type: "email" })}
      {field("minimumOrderValue", t("modules.suppliers.form.minimumOrder"), {
        placeholder: "0,00",
      })}

      <div className="space-y-2 md:col-span-2">
        <Label>{t("modules.suppliers.form.segments")}</Label>
        {readOnly ? (
          <div className="flex flex-wrap gap-2">
            {selectedLabels.length === 0 ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              selectedLabels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))
            )}
          </div>
        ) : (
          <Popover open={segmentsOpen} onOpenChange={setSegmentsOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
              >
                {selectedLabels.length > 0
                  ? t("modules.suppliers.form.segmentsSelected", { count: selectedLabels.length })
                  : t("modules.suppliers.form.segmentsPlaceholder")}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder={t("modules.suppliers.form.segmentsSearch")} />
                <CommandList>
                  <CommandEmpty>{t("modules.suppliers.form.segmentsEmpty")}</CommandEmpty>
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
        )}
        {form.formState.errors.segmentIds ? (
          <p className="text-sm text-destructive">{form.formState.errors.segmentIds.message}</p>
        ) : null}
      </div>
    </div>
  );
}
