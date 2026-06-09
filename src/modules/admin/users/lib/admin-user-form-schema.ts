import { z } from "zod";

export const adminUserCreateFormSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(250, "Nome com no máximo 250 caracteres"),
  email: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().max(15, "Telefone com no máximo 15 caracteres").optional().or(z.literal("")),
});

export type AdminUserCreateFormSchemaValues = z.infer<typeof adminUserCreateFormSchema>;

export const defaultAdminUserCreateFormValues: AdminUserCreateFormSchemaValues = {
  name: "",
  email: "",
  phone: "",
};
