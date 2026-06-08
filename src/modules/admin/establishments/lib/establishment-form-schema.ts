import { z } from "zod";

import { isCNPJValid, normalizeCNPJ } from "@/modules/admin/establishments/lib/cnpj";
import type { EstablishmentPaymentStatus } from "@/modules/admin/establishments/types";

const addressFieldsSchema = z.object({
  zipCode: z
    .string()
    .min(1, "CEP obrigatório")
    .refine((value) => /^\d{5}-\d{3}$/.test(value.trim()), { message: "CEP inválido" }),
  state: z.string().min(2, "Estado obrigatório").max(255),
  city: z.string().min(2, "Cidade obrigatória").max(255),
  neighborhood: z.string().min(2, "Bairro obrigatório").max(255),
  street: z.string().min(2, "Rua obrigatória").max(255),
  number: z.string().min(1, "Número obrigatório").max(255),
  complement: z.string().max(255).optional().or(z.literal("")),
});

const establishmentBaseSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(255),
  cnpj: z
    .string()
    .refine((value) => normalizeCNPJ(value).length === 14, { message: "CNPJ obrigatório" })
    .refine((value) => isCNPJValid(value), { message: "CNPJ inválido" }),
  status: z.enum(["pending", "paid", "late_payment", "canceled"]),
  responsibleName: z.string().trim().min(1, "Nome do responsável obrigatório").max(255),
  responsibleEmail: z.string().trim().email("E-mail inválido"),
  phone: z
    .string()
    .trim()
    .min(1, "Telefone obrigatório")
    .refine((value) => /^\+\d{10,15}$/.test(value), {
      message: "Telefone inválido (formato E.164, ex.: +5511999998888)",
    }),
  active: z.boolean(),
  parentEstablishmentId: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
});

export const establishmentFormSchema = establishmentBaseSchema.superRefine((values, ctx) => {
  const addressValues = {
    zipCode: values.zipCode,
    state: values.state,
    city: values.city,
    neighborhood: values.neighborhood,
    street: values.street,
    number: values.number,
    complement: values.complement,
  };
  const hasAddressValue = Object.values(addressValues).some(
    (value) => value !== "" && value !== undefined,
  );
  if (!hasAddressValue) return;

  const parsed = addressFieldsSchema.safeParse(addressValues);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      ctx.addIssue({ ...issue, path: [String(issue.path[0])] });
    });
  }
});

export type EstablishmentFormSchemaValues = z.infer<typeof establishmentFormSchema>;

export const defaultEstablishmentFormValues: EstablishmentFormSchemaValues = {
  name: "",
  cnpj: "",
  status: "pending",
  responsibleName: "",
  responsibleEmail: "",
  phone: "",
  active: true,
  parentEstablishmentId: "",
  zipCode: "",
  state: "",
  city: "",
  neighborhood: "",
  street: "",
  number: "",
  complement: "",
};

export function formValuesToPayload(values: EstablishmentFormSchemaValues) {
  const addressValues = {
    zipCode: values.zipCode?.trim(),
    state: values.state?.trim(),
    city: values.city?.trim(),
    neighborhood: values.neighborhood?.trim(),
    street: values.street?.trim(),
    number: values.number?.trim(),
    complement: values.complement?.trim(),
  };
  const hasAddress = Object.values(addressValues).some(Boolean);

  return {
    name: values.name.trim(),
    cnpj: values.cnpj.trim(),
    status: values.status as EstablishmentPaymentStatus,
    responsible: {
      name: values.responsibleName.trim(),
      email: values.responsibleEmail.trim().toLowerCase(),
    },
    active: values.active,
    phone: values.phone.trim(),
    address: hasAddress
      ? {
          zipCode: addressValues.zipCode ?? "",
          state: addressValues.state ?? "",
          city: addressValues.city ?? "",
          neighborhood: addressValues.neighborhood ?? "",
          street: addressValues.street ?? "",
          number: addressValues.number ?? "",
          complement: addressValues.complement || undefined,
        }
      : undefined,
    parentEstablishmentId: values.parentEstablishmentId?.trim() || null,
  };
}
