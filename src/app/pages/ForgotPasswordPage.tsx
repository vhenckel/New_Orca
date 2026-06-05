import { useState } from "react";
import { Link } from "react-router-dom";

import * as authApi from "@/shared/api/auth-api";
import { ApiError } from "@/shared/api/http-client";
import { forgotPasswordSchema } from "@/shared/auth/schemas";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "@/shared/ui/sonner";

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [method, setMethod] = useState<"whatsapp" | "email">("whatsapp");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const parsed = forgotPasswordSchema.safeParse({ identifier, method });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setSubmitting(true);
    try {
      const result = await authApi.forgotPassword(
        parsed.data.identifier,
        parsed.data.method,
      );
      toast.success(
        result.message ||
          "Se a conta existir, uma solicitação de redefinição será enviada",
      );
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a solicitação";
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
            <h1 className="text-xl font-semibold text-foreground">Esqueci minha senha</h1>
            <p className="text-sm text-muted-foreground">
              Informe seu e-mail para receber o link de redefinição.
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Se a conta existir, você receberá as instruções para redefinir sua senha.
              </p>
              <Button asChild>
                <Link to="/login">Voltar ao login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FieldGroup>
                <Field className="gap-2">
                  <FieldLabel htmlFor="forgot-email">E-mail</FieldLabel>
                  <FieldContent>
                    <Input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </FieldContent>
                  {fieldError ? <FieldError>{fieldError}</FieldError> : null}
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="forgot-method">Enviar por</FieldLabel>
                  <FieldContent>
                    <Select
                      value={method}
                      onValueChange={(value) =>
                        setMethod(value as "whatsapp" | "email")
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger id="forgot-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </FieldGroup>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Enviando…" : "Enviar solicitação"}
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Voltar ao login</Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
