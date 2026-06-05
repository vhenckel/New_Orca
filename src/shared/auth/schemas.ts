import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  method: z.enum(["email", "whatsapp"]),
});

export const NEW_PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(
        NEW_PASSWORD_REGEX,
        "Use ao menos 1 número, 1 letra minúscula e 1 maiúscula",
      ),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
