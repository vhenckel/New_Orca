import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import * as authApi from "@/shared/api/auth-api";
import { ApiError } from "@/shared/api/http-client";
import { resetPasswordSchema } from "@/shared/auth/schemas";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (done) {
    return (
      <div className="login-brand-panel flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/20 bg-white/95">
          <CardContent className="flex flex-col gap-4 p-8 text-center">
            <h1 className="text-xl font-semibold text-foreground">Senha redefinida</h1>
            <p className="text-sm text-muted-foreground">
              Sua senha foi atualizada. Faça login com a nova senha.
            </p>
            <Button asChild>
              <Link to="/login">Ir para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await authApi.resetPassword({
        token,
        newPassword: parsed.data.newPassword,
      });
      toast.success(result.message || "Senha redefinida com sucesso");
      setDone(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Não foi possível redefinir a senha";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-brand-panel flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/20 bg-white/95">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-foreground">Nova senha</h1>
            <p className="text-sm text-muted-foreground">
              Defina uma nova senha para acessar sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FieldGroup>
              <Field className="gap-2">
                <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
                <FieldContent>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </FieldContent>
                {fieldErrors.newPassword ? (
                  <FieldError>{fieldErrors.newPassword}</FieldError>
                ) : null}
              </Field>

              <Field className="gap-2">
                <FieldLabel htmlFor="confirm-password">Confirmar senha</FieldLabel>
                <FieldContent>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </FieldContent>
                {fieldErrors.confirmPassword ? (
                  <FieldError>{fieldErrors.confirmPassword}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Salvando…" : "Redefinir senha"}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">Voltar ao login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
