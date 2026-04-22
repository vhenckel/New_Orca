import { useState } from "react";
import { ArrowRight, BarChart3, CircleDollarSign, ShieldCheck } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import { useAuth } from "@/shared/auth/AuthContext";
import { Card, CardContent } from "@/shared/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const ORCA_LOGO_URL = "https://app-staging.orcadigital.com.br/assets/fullLogo-CMxBGJTo.png";

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
  const { login, loading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
    } catch {
      // error already set in context
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f3e9a] via-[#1844a4] to-[#0b2d78] text-white">
          <div className="absolute left-[-7rem] top-[-6rem] size-72 rounded-full bg-[#6f94ff]/20 blur-3xl" aria-hidden />
          <div className="absolute bottom-[-10rem] right-[-7rem] size-[28rem] rounded-full bg-white/25 blur-3xl" aria-hidden />

          <div className="relative flex min-h-full flex-col px-8 py-10 lg:px-14 lg:py-12">
            <div className="mb-16">
              <img
                src={ORCA_LOGO_URL}
                alt="Orca Cotação Digital"
                className="h-auto w-[180px] object-contain brightness-0 invert"
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

        <section className="relative flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fafbfe_0%,#f4f7fb_100%)] px-6 py-10 lg:px-12">
          <div className="w-full max-w-[28rem]">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 px-1">
                <h2 className="text-3xl font-semibold text-slate-950">Bem-vindo de volta</h2>
                <p className="text-sm leading-6 text-slate-500">
                  Entre com suas credenciais para acessar o painel
                </p>
              </div>

              <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
                <CardContent className="p-7 sm:p-8">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <FieldGroup className="gap-5">
                      <Field className="gap-2">
                        <FieldLabel htmlFor="login-username" className="text-slate-700">
                          E-mail
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="login-username"
                            type="email"
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="seu@email.com"
                            disabled={loading}
                            className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-primary/20"
                          />
                        </FieldContent>
                      </Field>

                      <Field className="gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <FieldLabel htmlFor="login-password" className="text-slate-700">
                            Senha
                          </FieldLabel>
                          <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-primary transition hover:underline"
                          >
                            Esqueci minha senha
                          </Link>
                        </div>
                        <FieldContent>
                          <Input
                            id="login-password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            disabled={loading}
                            className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-primary/20"
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>

                    {error && <FieldError>{error}</FieldError>}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 w-full rounded-xl text-white shadow-[0_14px_30px_rgba(100,103,242,0.35)] hover:text-white"
                    >
                      {loading ? "Entrando..." : "Entrar"}
                      {!loading && <ArrowRight data-icon="inline-end" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-slate-500">
                Não tem uma conta?{" "}
                <a href="#" className="font-medium text-primary transition hover:underline">
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
