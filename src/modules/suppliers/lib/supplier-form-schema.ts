import { z } from "zod";

const serviceAreaSchema = z.object({
  state: z.string(),
  city: z.string(),
  neighborhood: z.string(),
});

export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(255),
  responsibleName: z.string().trim().min(1, "Nome do responsável obrigatório").max(255),
  responsibleEmail: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().min(8, "Telefone obrigatório").max(20),
  minimumOrderValue: z.string().optional(),
  segmentIds: z.array(z.string().uuid()).min(1, "Selecione ao menos um segmento"),
  serviceAreas: z.array(serviceAreaSchema),
});

export type SupplierFormSchemaValues = z.infer<typeof supplierFormSchema>;

export const defaultSupplierFormValues: SupplierFormSchemaValues = {
  name: "",
  responsibleName: "",
  responsibleEmail: "",
  phone: "",
  minimumOrderValue: "",
  segmentIds: [],
  serviceAreas: [],
};
