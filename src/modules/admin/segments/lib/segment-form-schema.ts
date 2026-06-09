import { z } from "zod";

export const segmentFormSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(250, "Nome com no máximo 250 caracteres"),
  active: z.boolean(),
});

export type SegmentFormSchemaValues = z.infer<typeof segmentFormSchema>;

export const defaultSegmentFormValues: SegmentFormSchemaValues = {
  name: "",
  active: true,
};

export function capitalizeSegmentName(value: string): string {
  return value.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
}

export function mapDetailToForm(detail: { name: string; active: boolean }): SegmentFormSchemaValues {
  return {
    name: detail.name,
    active: detail.active,
  };
}

export function formValuesToCreatePayload(values: SegmentFormSchemaValues): { name: string } {
  return { name: values.name.trim() };
}

export function formValuesToUpdatePayload(values: SegmentFormSchemaValues): {
  name: string;
  active: boolean;
} {
  return {
    name: values.name.trim(),
    active: values.active,
  };
}
