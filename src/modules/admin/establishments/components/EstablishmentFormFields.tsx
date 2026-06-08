import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { searchEstablishmentsForParent } from "@/modules/admin/establishments/api/establishments-api";
import { useLocationAddressByCep } from "@/modules/admin/establishments/hooks/useLocationAddressByCep";
import { formatCNPJ } from "@/modules/admin/establishments/lib/cnpj";
import type { EstablishmentFormSchemaValues } from "@/modules/admin/establishments/lib/establishment-form-schema";
import { useI18n } from "@/shared/i18n/useI18n";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "late_payment", "canceled"] as const;

const fieldControlClassName = "bg-card";

interface EstablishmentFormFieldsProps {
  form: UseFormReturn<EstablishmentFormSchemaValues>;
  excludeEstablishmentId?: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function EstablishmentFormFields({ form, excludeEstablishmentId }: EstablishmentFormFieldsProps) {
  const { t } = useI18n();
  const { register, setValue, watch, formState } = form;
  const [parentOpen, setParentOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");

  const zipCode = watch("zipCode") ?? "";
  const cepQuery = useLocationAddressByCep(zipCode);

  useEffect(() => {
    if (!cepQuery.isSuccess || !cepQuery.data) return;
    setValue("state", cepQuery.data.state, { shouldDirty: true });
    setValue("city", cepQuery.data.city, { shouldDirty: true });
    setValue("neighborhood", cepQuery.data.neighborhood, { shouldDirty: true });
    setValue("street", cepQuery.data.street, { shouldDirty: true });
  }, [cepQuery.isSuccess, cepQuery.data, setValue]);

  const parentQuery = useQuery({
    queryKey: ["establishments", "parent-search", parentSearch],
    queryFn: () => searchEstablishmentsForParent(parentSearch),
    enabled: parentOpen,
  });

  const parentOptions = (parentQuery.data ?? []).filter((item) => item.id !== excludeEstablishmentId);
  const selectedParentId = watch("parentEstablishmentId");
  const selectedParentName =
    parentOptions.find((item) => item.id === selectedParentId)?.name ??
    (selectedParentId ? t("modules.admin.establishments.form.parentSelected") : "");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="est-name">{t("modules.admin.establishments.form.name")}</Label>
          <Input id="est-name" className={fieldControlClassName} {...register("name")} />
          <FieldError message={formState.errors.name?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="est-cnpj">{t("modules.admin.establishments.form.cnpj")}</Label>
          <Input
            id="est-cnpj"
            className={fieldControlClassName}
            {...register("cnpj")}
            onChange={(e) => setValue("cnpj", formatCNPJ(e.target.value), { shouldValidate: true })}
          />
          <FieldError message={formState.errors.cnpj?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("modules.admin.establishments.form.paymentStatus")}</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) =>
              setValue("status", value as EstablishmentFormSchemaValues["status"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className={fieldControlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`modules.admin.establishments.status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={formState.errors.status?.message} />
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
          <Label htmlFor="est-active">{t("modules.admin.establishments.form.active")}</Label>
          <Switch
            id="est-active"
            checked={watch("active")}
            onCheckedChange={(checked) => setValue("active", checked, { shouldValidate: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="est-responsible-name">
            {t("modules.admin.establishments.form.responsibleName")}
          </Label>
          <Input id="est-responsible-name" className={fieldControlClassName} {...register("responsibleName")} />
          <FieldError message={formState.errors.responsibleName?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="est-responsible-email">
            {t("modules.admin.establishments.form.responsibleEmail")}
          </Label>
          <Input
            id="est-responsible-email"
            type="email"
            className={fieldControlClassName}
            {...register("responsibleEmail")}
          />
          <FieldError message={formState.errors.responsibleEmail?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="est-phone">{t("modules.admin.establishments.form.phone")}</Label>
          <Input
            id="est-phone"
            className={fieldControlClassName}
            placeholder="+5511999998888"
            {...register("phone")}
          />
          <FieldError message={formState.errors.phone?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("modules.admin.establishments.form.parentEstablishment")}</Label>
          <Popover open={parentOpen} onOpenChange={setParentOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("w-full justify-start font-normal", fieldControlClassName)}
              >
                {selectedParentName || t("modules.admin.establishments.form.parentPlaceholder")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={t("modules.admin.establishments.form.parentSearch")}
                  value={parentSearch}
                  onValueChange={setParentSearch}
                />
                <CommandList>
                  {parentQuery.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>{t("modules.admin.establishments.form.parentEmpty")}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__none__"
                          onSelect={() => {
                            setValue("parentEstablishmentId", "");
                            setParentOpen(false);
                          }}
                        >
                          {t("modules.admin.establishments.form.parentNone")}
                        </CommandItem>
                        {parentOptions.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            onSelect={() => {
                              setValue("parentEstablishmentId", item.id);
                              setParentOpen(false);
                            }}
                          >
                            {item.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium">{t("modules.admin.establishments.form.addressSection")}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="est-zip">{t("modules.admin.establishments.form.zipCode")}</Label>
            <Input
              id="est-zip"
              className={fieldControlClassName}
              placeholder="00000-000"
              value={zipCode}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                const formatted =
                  digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
                setValue("zipCode", formatted, { shouldValidate: true });
              }}
            />
            <FieldError message={formState.errors.zipCode?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="est-state">{t("modules.admin.establishments.form.state")}</Label>
            <Input id="est-state" className={fieldControlClassName} {...register("state")} />
            <FieldError message={formState.errors.state?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="est-city">{t("modules.admin.establishments.form.city")}</Label>
            <Input id="est-city" className={fieldControlClassName} {...register("city")} />
            <FieldError message={formState.errors.city?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="est-neighborhood">{t("modules.admin.establishments.form.neighborhood")}</Label>
            <Input id="est-neighborhood" className={fieldControlClassName} {...register("neighborhood")} />
            <FieldError message={formState.errors.neighborhood?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="est-street">{t("modules.admin.establishments.form.street")}</Label>
            <Input id="est-street" className={fieldControlClassName} {...register("street")} />
            <FieldError message={formState.errors.street?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="est-number">{t("modules.admin.establishments.form.number")}</Label>
            <Input id="est-number" className={fieldControlClassName} {...register("number")} />
            <FieldError message={formState.errors.number?.message} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="est-complement">{t("modules.admin.establishments.form.complement")}</Label>
            <Input id="est-complement" className={fieldControlClassName} {...register("complement")} />
          </div>
        </div>
      </div>
    </div>
  );
}
