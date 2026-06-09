import type { UseFormReturn } from "react-hook-form";

import {
  capitalizeSegmentName,
  type SegmentFormSchemaValues,
} from "@/modules/admin/segments/lib/segment-form-schema";
import { useI18n } from "@/shared/i18n/useI18n";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

interface SegmentFormFieldsProps {
  form: UseFormReturn<SegmentFormSchemaValues>;
  showActive: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function SegmentFormFields({ form, showActive }: SegmentFormFieldsProps) {
  const { t } = useI18n();
  const { register, setValue, watch, formState } = form;
  const active = watch("active");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="segment-name">{t("modules.admin.segments.form.name")}</Label>
        <Input
          id="segment-name"
          className="bg-card"
          maxLength={250}
          placeholder={t("modules.admin.segments.form.namePlaceholder")}
          {...register("name", {
            onChange: (event) => {
              setValue("name", capitalizeSegmentName(event.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              });
            },
          })}
        />
        <FieldError message={formState.errors.name?.message} />
      </div>

      {showActive ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="segment-active">{t("modules.admin.segments.form.active")}</Label>
          <div className="flex h-9 items-center">
            <Switch
              id="segment-active"
              checked={active}
              onCheckedChange={(checked) =>
                setValue("active", checked, { shouldDirty: true, shouldValidate: true })
              }
            />
          </div>
          <FieldError message={formState.errors.active?.message} />
        </div>
      ) : null}
    </div>
  );
}
