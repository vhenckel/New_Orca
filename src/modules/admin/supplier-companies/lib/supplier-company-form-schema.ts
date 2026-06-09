import { z } from "zod";

export function normalizeMoneyToApi(value: string): string {
  const cleanValue = value.replace(/\./g, "").replace(",", ".");
  const num = Number(cleanValue);
  if (!Number.isFinite(num)) return cleanValue;
  return num.toFixed(2);
}

export function formatMoneyForInput(value?: string | null): string {
  if (!value) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export const supplierCompanyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome obrigatório")
    .max(255, "Nome com no máximo 255 caracteres"),
  minimumOrderValue: z
    .string()
    .trim()
    .min(1, "Pedido mínimo obrigatório")
    .transform((value) => normalizeMoneyToApi(value)),
  allowSupplierMinimumOrderCustomization: z.boolean(),
  segmentIds: z.array(z.string().uuid()),
  supplierIds: z.array(z.string().uuid()),
});

export type SupplierCompanyFormSchemaValues = z.infer<typeof supplierCompanyFormSchema>;

export const defaultSupplierCompanyFormValues: Omit<SupplierCompanyFormSchemaValues, "minimumOrderValue"> & {
  minimumOrderValue: string;
} = {
  name: "",
  minimumOrderValue: "",
  allowSupplierMinimumOrderCustomization: false,
  segmentIds: [],
  supplierIds: [],
};

export function mapDetailToForm(detail: {
  name: string;
  minimumOrderValue: string;
  allowSupplierMinimumOrderCustomization: boolean;
  segments: { id: string }[];
  suppliers: { id: string }[];
}): Omit<SupplierCompanyFormSchemaValues, "minimumOrderValue"> & { minimumOrderValue: string } {
  return {
    name: detail.name,
    minimumOrderValue: formatMoneyForInput(detail.minimumOrderValue),
    allowSupplierMinimumOrderCustomization: detail.allowSupplierMinimumOrderCustomization,
    segmentIds: detail.segments.map((s) => s.id),
    supplierIds: detail.suppliers.map((s) => s.id),
  };
}

export function formValuesToPayload(
  values: SupplierCompanyFormSchemaValues,
): {
  name: string;
  minimumOrderValue: string;
  allowSupplierMinimumOrderCustomization: boolean;
  segmentIds: string[];
  supplierIds: string[];
} {
  return {
    name: values.name.trim(),
    minimumOrderValue: values.minimumOrderValue,
    allowSupplierMinimumOrderCustomization: values.allowSupplierMinimumOrderCustomization,
    segmentIds: values.segmentIds,
    supplierIds: values.supplierIds,
  };
}
