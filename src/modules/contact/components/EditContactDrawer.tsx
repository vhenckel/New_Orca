import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";

import {
  createContact,
  fetchContactFields,
  fetchContactForEdit,
  fetchPersonContactQuery,
  setPersonMainContact,
  updateContact,
} from "@/modules/contact/services";
import type { ContactEntityForEdit } from "@/modules/contact/types/contact-edit";
import type { PersonContactListItem } from "@/modules/contact/types/person-contact";
import {
  appkeyToLocalDigits,
  digitsOnly,
  localDigitsToAppkey,
} from "@/modules/contact/utils/phone-form";
import { useI18n } from "@/shared/i18n/useI18n";
import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { Button } from "@/shared/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  SidePanel,
  SidePanelBody,
  SidePanelContent,
  SidePanelDescription,
  SidePanelTitle,
} from "@/shared/ui/side-panel";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import { toast } from "@/shared/ui/sonner";

export type EditContactFormValues = {
  name: string;
  document: string;
  email: string;
  pix: string;
  lastPipelineStageId: string;
  birthDate: string;
  genreId: string;
  maritalStatusId: string;
  schoolingId: string;
  profession: string;
  professionalSituationId: string;
  incomeId: string;
  personaId: string;
  addressStreet: string;
  addressNumber: string;
  addressAdjunct: string;
  addressZipcode: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  whatsappRows: { contactId?: number; localDigits: string; isInBlackList?: boolean }[];
  /** Índice da linha WhatsApp principal (válido com 2+ linhas e vínculo em person). */
  mainRowIndex: number;
};

function toInputDate(v: string | Date | null | undefined): string {
  if (v == null || v === "") return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  if (s.includes("T")) return s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return "";
}

function documentDigitsFromContact(c: ContactEntityForEdit): string {
  const cnpj = c.cnpj?.replace(/\D/g, "") ?? "";
  const cpf = c.cpf?.replace(/\D/g, "") ?? "";
  if (cnpj.length > 11) return cnpj;
  if (cpf.length) return cpf;
  return "";
}

function optStr(n: number | string | null | undefined): string {
  if (n == null || n === "") return "";
  return String(n);
}

function buildSharedPayload(values: EditContactFormValues): Record<string, unknown> {
  const document = digitsOnly(values.document);
  const isCPF = document.length <= 11 && document.length > 0;

  const payload: Record<string, unknown> = {
    lastPipelineGroupId: "",
    name: values.name?.trim() || undefined,
    email: values.email?.trim() || null,
    pix: values.pix?.trim() || null,
    lastPipelineStageId: values.lastPipelineStageId
      ? Number(values.lastPipelineStageId)
      : null,
    genreId: values.genreId || null,
    maritalStatusId: values.maritalStatusId || null,
    schoolingId: values.schoolingId || null,
    profession: values.profession?.trim() || null,
    professionalSituationId: values.professionalSituationId || null,
    incomeId: values.incomeId || null,
    personaId: values.personaId || null,
    birthDate: values.birthDate || null,
    addressStreet: values.addressStreet?.trim() || null,
    addressNumber: values.addressNumber?.trim() || null,
    addressAdjunct: values.addressAdjunct?.trim() || null,
    addressZipcode: values.addressZipcode?.trim() || null,
    addressNeighborhood: values.addressNeighborhood?.trim() || null,
    addressCity: values.addressCity?.trim() || null,
    addressState: values.addressState?.trim() || null,
    addressCountry: values.addressCountry?.trim() || null,
  };

  if (document) {
    if (isCPF) {
      payload.cpf = document;
      payload.cnpj = null;
    } else {
      payload.cnpj = document;
      payload.cpf = null;
    }
  } else {
    payload.cpf = null;
    payload.cnpj = null;
  }

  return payload;
}

export interface EditContactDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: number;
  linkedContacts: PersonContactListItem[];
  /** Quando não há cluster, usa o telefone do detalhe. */
  fallbackPhone?: string | null;
}

export function EditContactDrawer({
  open,
  onOpenChange,
  contactId,
  linkedContacts,
  fallbackPhone,
}: EditContactDrawerProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: fields, isLoading: fieldsLoading, isError: fieldsErr } = useQuery({
    queryKey: ["contact", "fields"],
    queryFn: fetchContactFields,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: contactEntity,
    isLoading: contactLoading,
    isError: contactErr,
  } = useQuery({
    queryKey: ["contact", "for-edit", contactId],
    queryFn: () => fetchContactForEdit(contactId),
    enabled: open && contactId > 0,
  });

  const defaultRows = useMemo(() => {
    if (linkedContacts.length > 0) {
      return linkedContacts.map((c) => ({
        contactId: c.id,
        localDigits: appkeyToLocalDigits(c.appkey ?? ""),
        isInBlackList: c.isInBlackList,
      }));
    }
    const fb = fallbackPhone ? appkeyToLocalDigits(fallbackPhone) : "";
    return [{ contactId, localDigits: fb, isInBlackList: false }];
  }, [linkedContacts, contactId, fallbackPhone]);

  const defaultMainRowIndex = useMemo(() => {
    if (linkedContacts.length === 0) return 0;
    const i = linkedContacts.findIndex((c) => c.main);
    const preferred = i >= 0 ? i : 0;
    if (!linkedContacts[preferred]?.isInBlackList) return preferred;
    const next = linkedContacts.findIndex((c) => !c.isInBlackList);
    return next >= 0 ? next : 0;
  }, [linkedContacts]);

  const defaults = useMemo((): EditContactFormValues => {
    const c = contactEntity;
    if (!c) {
      return {
        name: "",
        document: "",
        email: "",
        pix: "",
        lastPipelineStageId: "",
        birthDate: "",
        genreId: "",
        maritalStatusId: "",
        schoolingId: "",
        profession: "",
        professionalSituationId: "",
        incomeId: "",
        personaId: "",
        addressStreet: "",
        addressNumber: "",
        addressAdjunct: "",
        addressZipcode: "",
        addressNeighborhood: "",
        addressCity: "",
        addressState: "",
        addressCountry: "",
        whatsappRows: defaultRows,
        mainRowIndex: defaultMainRowIndex,
      };
    }
    return {
      name: c.name ?? "",
      document: documentDigitsFromContact(c),
      email: (c.email as string) ?? "",
      pix: (c.pix as string) ?? "",
      lastPipelineStageId: optStr(c.lastPipelineStageId),
      birthDate: toInputDate(c.birthDate as string | Date | null),
      genreId: optStr(c.genreId),
      maritalStatusId: optStr(c.maritalStatusId),
      schoolingId: optStr(c.schoolingId),
      profession: c.profession ?? "",
      professionalSituationId: optStr(c.professionalSituationId),
      incomeId: optStr(c.incomeId),
      personaId: optStr(c.personaId),
      addressStreet: c.addressStreet ?? "",
      addressNumber: c.addressNumber ?? "",
      addressAdjunct: c.addressAdjunct ?? "",
      addressZipcode: c.addressZipcode ?? "",
      addressNeighborhood: c.addressNeighborhood ?? "",
      addressCity: c.addressCity ?? "",
      addressState: c.addressState ?? "",
      addressCountry: c.addressCountry ?? "",
      whatsappRows: defaultRows,
      mainRowIndex: defaultMainRowIndex,
    };
  }, [contactEntity, defaultRows, defaultMainRowIndex]);

  const form = useForm<EditContactFormValues>({
    defaultValues: defaults,
  });
  const { control, getValues, handleSubmit, register, reset, setValue, watch } = form;
  const [submitting, setSubmitting] = useState(false);

  const { fields: waFields, append, remove } = useFieldArray({
    control,
    name: "whatsappRows",
  });

  useEffect(() => {
    if (!open || !contactEntity) return;
    reset(defaults);
  }, [open, contactEntity, defaults, reset]);

  const loading = open && (fieldsLoading || contactLoading);
  const loadFailed = open && (fieldsErr || contactErr) && !loading;
  const companyId = getCurrentCompanyId();

  async function onSubmit(values: EditContactFormValues) {
    const rows = values.whatsappRows ?? [];
    const digitsSet = new Set<string>();
    for (const r of rows) {
      const ak = localDigitsToAppkey(r.localDigits);
      if (!ak) {
        toast.error(t("pages.contact.editDrawer.errorPhoneRequired"));
        return;
      }
      if (digitsSet.has(ak)) {
        toast.error(t("pages.contact.editDrawer.errorDuplicatePhone"));
        return;
      }
      digitsSet.add(ak);
    }

    if (!values.lastPipelineStageId) {
      toast.error(t("pages.contact.editDrawer.errorPipeline"));
      return;
    }

    const doc = digitsOnly(values.document);
    if (!doc) {
      toast.error(t("pages.contact.editDrawer.errorDocument"));
      return;
    }

    const shared = buildSharedPayload(values);

    setSubmitting(true);
    try {
      const idsByRow: number[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.isInBlackList) {
          if (!row.contactId) {
            throw new Error(t("pages.contact.editDrawer.errorGeneric"));
          }
          idsByRow.push(row.contactId);
          continue;
        }
        const appkey = localDigitsToAppkey(row.localDigits);
        const rowPayload: Record<string, unknown> = {
          ...shared,
          companyId,
          channelTypeId: 1,
          appkey,
          phone: appkey,
          lastPipelineGroupId: "",
        };

        if (row.contactId) {
          await updateContact(row.contactId, rowPayload);
          idsByRow.push(row.contactId);
        } else {
          const created = await createContact({
            ...rowPayload,
            originId: "9",
          });
          idsByRow.push(created.id);
        }
      }

      const mainIdx = Math.min(
        Math.max(0, values.mainRowIndex ?? 0),
        idsByRow.length - 1,
      );
      const mainContactId = idsByRow[mainIdx];

      if (rows.length > 1) {
        const cluster = await fetchPersonContactQuery(contactId);
        if (cluster.personId != null) {
          await setPersonMainContact(mainContactId);
        }
      }

      toast.success(t("pages.contact.editDrawer.success"));
      await queryClient.invalidateQueries({ queryKey: ["contact", "details", contactId] });
      await queryClient.invalidateQueries({ queryKey: ["contact", "person-cluster", contactId] });
      await queryClient.invalidateQueries({ queryKey: ["contact", "for-edit", contactId] });
      await queryClient.invalidateQueries({ queryKey: ["contact", "list"] });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.contact.editDrawer.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SidePanel open={open} onOpenChange={onOpenChange}>
      <SidePanelContent size="xl" className="flex flex-col p-0">
        <SidePanelLayout
          header={
            <>
              <SidePanelTitle>{t("pages.contact.editDrawer.title")}</SidePanelTitle>
              <SidePanelDescription>{t("pages.contact.editDrawer.description")}</SidePanelDescription>
            </>
          }
          footerLeft={
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
          }
          footerRight={
            <Button
              type="button"
              disabled={loading || submitting}
              onClick={() => void handleSubmit(onSubmit)()}
            >
              {loading || submitting ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : null}
              {t("pages.contact.editDrawer.save")}
            </Button>
          }
          bodyClassName="p-0"
        >
          <SidePanelBody className="px-4 py-4">
            {loadFailed ? (
              <p className="text-center text-sm text-destructive">
                {t("pages.contact.editDrawer.loadError")}
              </p>
            ) : loading ? (
              <div className="flex min-h-[200px] items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                {t("pages.contact.editDrawer.loading")}
              </div>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldName")}</FieldLabel>
                    <FieldContent>
                      <Input {...register("name")} autoComplete="name" />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldLifecycle")}</FieldLabel>
                    <FieldContent>
                      <Select
                        value={watch("lastPipelineStageId") || undefined}
                        onValueChange={(v) => setValue("lastPipelineStageId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("pages.contact.editDrawer.selectPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {(fields?.pipelines ?? []).map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <div className="flex flex-col gap-2">
                    <FieldLabel>{t("pages.contact.editDrawer.fieldWhatsApp")}</FieldLabel>
                    {waFields.length > 1 ? (
                      <p className="text-xs text-muted-foreground">
                        {t("pages.contact.editDrawer.mainPhoneHint")}
                      </p>
                    ) : null}
                    {waFields.length > 1 ? (
                      <RadioGroup
                        className="gap-3"
                        value={String(watch("mainRowIndex") ?? 0)}
                        onValueChange={(v) => setValue("mainRowIndex", Number(v))}
                      >
                        {waFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                            <RadioGroupItem
                              value={String(index)}
                              id={`edit-contact-wa-main-${field.id}`}
                              className="shrink-0"
                              aria-label={t("pages.contact.editDrawer.mainPhoneAria")}
                              disabled={Boolean(
                                watch(`whatsappRows.${index}.isInBlackList` as const),
                              )}
                            />
                            <Input
                              className="min-w-0 flex-1"
                              placeholder={t("pages.contact.editDrawer.phonePlaceholder")}
                              inputMode="numeric"
                              autoComplete="tel"
                              {...register(`whatsappRows.${index}.localDigits` as const)}
                              disabled={Boolean(watch(`whatsappRows.${index}.isInBlackList` as const))}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              onClick={() => {
                                if (getValues(`whatsappRows.${index}.isInBlackList` as const)) return;
                                const current = getValues("mainRowIndex") ?? 0;
                                remove(index);
                                if (index < current) {
                                  setValue("mainRowIndex", Math.max(0, current - 1));
                                } else if (index === current) {
                                  setValue("mainRowIndex", 0);
                                }
                              }}
                              disabled={Boolean(getValues(`whatsappRows.${index}.isInBlackList` as const))}
                              aria-label={t("pages.contact.editDrawer.removePhone")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      waFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <Input
                            placeholder={t("pages.contact.editDrawer.phonePlaceholder")}
                            inputMode="numeric"
                            autoComplete="tel"
                            {...register(`whatsappRows.${index}.localDigits` as const)}
                            disabled={Boolean(watch(`whatsappRows.${index}.isInBlackList` as const))}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => remove(index)}
                            disabled={waFields.length <= 1}
                            aria-label={t("pages.contact.editDrawer.removePhone")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-1"
                      onClick={() => append({ localDigits: "", isInBlackList: false })}
                    >
                      <Plus className="h-4 w-4" />
                      {t("pages.contact.editDrawer.addPhone")}
                    </Button>
                  </div>

                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldDocument")}</FieldLabel>
                    <FieldContent>
                      <Input {...register("document")} inputMode="numeric" />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldPix")}</FieldLabel>
                    <FieldContent>
                      <Input {...register("pix")} />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldEmail")}</FieldLabel>
                    <FieldContent>
                      <Input type="email" {...register("email")} />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldBirthDate")}</FieldLabel>
                    <FieldContent>
                      <Input type="date" {...register("birthDate")} />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldGenre")}</FieldLabel>
                      <FieldContent>
                        <Select
                          value={watch("genreId") || "__empty__"}
                          onValueChange={(v) => setValue("genreId", v === "__empty__" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__empty__">—</SelectItem>
                            {(fields?.genre ?? []).map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldMarital")}</FieldLabel>
                      <FieldContent>
                        <Select
                          value={watch("maritalStatusId") || "__empty__"}
                          onValueChange={(v) =>
                            setValue("maritalStatusId", v === "__empty__" ? "" : v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__empty__">—</SelectItem>
                            {(fields?.maritalStatus ?? []).map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldSchooling")}</FieldLabel>
                      <FieldContent>
                        <Select
                          value={watch("schoolingId") || "__empty__"}
                          onValueChange={(v) => setValue("schoolingId", v === "__empty__" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__empty__">—</SelectItem>
                            {(fields?.schooling ?? []).map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldIncome")}</FieldLabel>
                      <FieldContent>
                        <Select
                          value={watch("incomeId") || "__empty__"}
                          onValueChange={(v) => setValue("incomeId", v === "__empty__" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__empty__">—</SelectItem>
                            {(fields?.incomes ?? []).map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldProfession")}</FieldLabel>
                    <FieldContent>
                      <Input {...register("profession")} />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldProfSituation")}</FieldLabel>
                      <FieldContent>
                        <Select
                          value={watch("professionalSituationId") || "__empty__"}
                          onValueChange={(v) =>
                            setValue("professionalSituationId", v === "__empty__" ? "" : v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__empty__">—</SelectItem>
                            {(fields?.professionalSituation ?? []).map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldPersona")}</FieldLabel>
                      <FieldContent>
                        <Select
                          value={watch("personaId") || "__empty__"}
                          onValueChange={(v) => setValue("personaId", v === "__empty__" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__empty__">—</SelectItem>
                            {(fields?.persona ?? []).map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>{t("pages.contact.editDrawer.fieldAddress")}</FieldLabel>
                    <FieldContent>
                      <Input {...register("addressStreet")} />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldNumber")}</FieldLabel>
                      <FieldContent>
                        <Input {...register("addressNumber")} />
                      </FieldContent>
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel>{t("pages.contact.editDrawer.fieldAdjunct")}</FieldLabel>
                      <FieldContent>
                        <Input {...register("addressAdjunct")} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldZip")}</FieldLabel>
                      <FieldContent>
                        <Input {...register("addressZipcode")} />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldNeighborhood")}</FieldLabel>
                      <FieldContent>
                        <Input {...register("addressNeighborhood")} />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldCity")}</FieldLabel>
                      <FieldContent>
                        <Input {...register("addressCity")} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldState")}</FieldLabel>
                      <FieldContent>
                        <Input {...register("addressState")} />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>{t("pages.contact.editDrawer.fieldCountry")}</FieldLabel>
                      <FieldContent>
                        <Input {...register("addressCountry")} />
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>
              </form>
            )}
          </SidePanelBody>
        </SidePanelLayout>
      </SidePanelContent>
    </SidePanel>
  );
}
