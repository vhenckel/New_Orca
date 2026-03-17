import { useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";

import { useAuth } from "@/shared/auth/AuthContext";
import type { LoginRequest } from "@/shared/auth/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Lock, User } from "lucide-react";

const O2OSPOT_LOGO = "https://assets.o2ospot.com/spot/icons/o2ospot.svg";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login, loading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const callbackUrl = searchParams.get("callbackUrl") ?? from ?? "/";

  if (isAuthenticated) {
    return <Navigate to={callbackUrl} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const credentials: LoginRequest = { username, password };
    try {
      await login(credentials, { callbackUrl });
    } catch {
      // error already set in context
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#0a4a8a] to-[#0a1a3e]">
      {/* Background image layer – same as management (center bottom, cover, 60% opacity) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-no-repeat opacity-60"
        style={{
          backgroundImage: "url('/images/login-bg.png')",
          backgroundPosition: "center bottom",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row lg:items-stretch">
        {/* Left: title */}
        <section className="flex min-h-0 flex-1 items-center justify-center px-6 py-10 lg:min-h-screen lg:px-10 lg:py-12">
          <div className="max-w-[500px]">
            <h1 className="text-3xl font-semibold leading-tight text-white lg:text-4xl lg:leading-[48px] lg:tracking-tight">
              Serviços financeiros tão fáceis quanto uma boa conversa
            </h1>
          </div>
        </section>

        {/* Middle: spacer (optional bg image on lg) */}
        <section className="hidden min-h-screen flex-1 lg:block" aria-hidden />

        {/* Right: form */}
        <section className="flex min-h-0 flex-1 items-center justify-center px-5 py-8 lg:min-h-screen lg:px-10 lg:py-12">
          <div className="w-full max-w-[420px] rounded-3xl border border-white/35 bg-white/10 px-8 py-10 shadow-2xl backdrop-blur-xl sm:px-10 sm:py-12">
            <div className="mb-8 flex justify-center">
              <img
                src={O2OSPOT_LOGO}
                alt="Logo O2OSPOT"
                className="h-auto w-[200px] sm:w-[220px]"
              />
            </div>
            <h2 className="mb-8 text-center text-2xl font-semibold text-white">
              Acesse sua conta
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="login-username"
                  className="text-sm font-medium text-white"
                >
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="login-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    required
                    disabled={loading}
                    className="h-12 border-white/50 bg-white/90 pl-10 text-[15px] text-neutral-900 placeholder:text-neutral-500 focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="login-password"
                  className="text-sm font-medium text-white"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    disabled={loading}
                    className="h-12 border-white/50 bg-white/90 pl-10 pr-10 text-[15px] text-neutral-900 placeholder:text-neutral-500 focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-white underline hover:text-white/80"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {error && (
                <p
                  className="text-sm font-normal leading-5 text-red-400"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-[52px] w-full rounded-lg bg-[#1890ff] text-base font-semibold text-white hover:bg-[#40a9ff] hover:shadow-lg hover:shadow-[#1890ff]/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? "Entrando…" : "Entrar"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
