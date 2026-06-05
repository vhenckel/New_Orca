import { useState } from "react";
import { ArrowRight, BarChart3, CircleDollarSign, ShieldCheck } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { resolvePostLoginPath, useAuth } from "@/shared/auth/AuthContext";
import { loginSchema } from "@/shared/auth/schemas";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { ParticleField } from "@/shared/components/auth";
import { ORCA_LOGO_FULL_LIGHT } from "@/shared/theme/brand-assets";
import { ORCA_ORANGE, ORCA_PETROLEUM } from "@/shared/theme/brand-colors";
import { Card, CardContent } from "@/shared/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

const loginHighlights = [
  {
    icon: BarChart3,
    title: "Cotações centralizadas",
    description: "Compare preços de todos os fornecedores",
  },
  {
    icon: CircleDollarSign,
    title: "Economia real",
    description: "Clientes economizam em média 18% nas compras",
  },
  {
    icon: ShieldCheck,
    title: "Controle total",
    description: "Histórico, relatórios e rastreabilidade",
  },
] as const;

export function LoginPage() {
  const { login, loading, error, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const redirectFrom = (location.state as { from?: string } | null)?.from;

  if (isAuthenticated && user) {
    const to = resolvePostLoginPath(user.persona, redirectFrom, { isMobile });
    return <Navigate to={to} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
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

    try {
      await login(
        {
          email: parsed.data.email.trim().toLowerCase(),
          password: parsed.data.password,
        },
        redirectFrom,
      );
    } catch {
      // error already set in context
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8fa" }}>
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="login-brand-panel relative overflow-hidden">
          <ParticleField className="z-0" />
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${ORCA_ORANGE}14, transparent 55%)`,
            }}
            aria-hidden
          />

          <div className="relative z-10 flex min-h-full flex-col px-8 py-10 lg:px-14 lg:py-12">
            <div className="mb-16">
              <img
                src={ORCA_LOGO_FULL_LIGHT}
                alt="Orca Cotação Digital"
                className="h-auto w-[240px] max-w-full object-contain object-left"
              />
            </div>

            <div className="my-auto flex max-w-[30rem] flex-col gap-10">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-semibold leading-tight text-white lg:text-5xl lg:leading-[1.05]">
                  Compras inteligentes para o seu restaurante
                </h1>
                <p className="max-w-md text-base leading-7 text-white/78">
                  Compare fornecedores, negocie melhor e economize — tudo em uma única plataforma.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {loginHighlights.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-white/90" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-white">{title}</span>
                      <p className="text-sm leading-6 text-white/64">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-white/58">© 2026 Orca. Todos os direitos reservados.</p>
          </div>
        </section>

        <section className="login-form-panel relative flex items-center justify-center overflow-hidden px-6 py-10 lg:px-12">
          <div className="w-full max-w-[28rem]">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 px-1">
                <h2 className="text-3xl font-semibold" style={{ color: ORCA_PETROLEUM }}>
                  Bem-vindo de volta
                </h2>
                <p className="text-sm leading-6 text-[#475569]">
                  Entre com seu e-mail e senha para acessar o painel
                </p>
              </div>

              <Card className="rounded-[28px] border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <CardContent className="p-7 sm:p-8">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
                    <FieldGroup className="gap-5">
                      <Field className="gap-2">
                        <FieldLabel htmlFor="login-email" className="text-[#0f172a]">
                          E-mail
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="login-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            disabled={loading}
                            className="h-11 rounded-xl border-[#e2e8f0] bg-[#f7f8fa] text-[#0f172a] shadow-none placeholder:text-[#94a3b8] focus-visible:ring-[#ff6b1a]/25"
                          />
                        </FieldContent>
                        {fieldErrors.email ? (
                          <FieldError>{fieldErrors.email}</FieldError>
                        ) : null}
                      </Field>

                      <Field className="gap-2">
                        <FieldLabel htmlFor="login-password" className="text-[#0f172a]">
                          Senha
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="login-password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                            className="h-11 rounded-xl border-[#e2e8f0] bg-[#f7f8fa] text-[#0f172a] shadow-none placeholder:text-[#94a3b8] focus-visible:ring-[#ff6b1a]/25"
                          />
                        </FieldContent>
                        {fieldErrors.password ? (
                          <FieldError>{fieldErrors.password}</FieldError>
                        ) : null}
                      </Field>
                    </FieldGroup>

                    {error ? <FieldError>{error}</FieldError> : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "login-cta inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b1a]/40 focus-visible:ring-offset-2",
                        "disabled:pointer-events-none disabled:opacity-50",
                      )}
                    >
                      {loading ? "Entrando..." : "Entrar"}
                      {!loading && <ArrowRight className="size-4" />}
                    </button>

                    <Link
                      to="/esqueci-minha-senha"
                      className="text-center text-sm transition login-link-accent hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-[#475569]">
                Não tem uma conta?{" "}
                <a href="#" className="login-link-accent font-medium transition hover:underline">
                  Solicitar acesso
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
