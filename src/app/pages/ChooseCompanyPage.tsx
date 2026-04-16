import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import { fetchUserAccounts, switchCompany } from "@/shared/api/auth-api";
import { clearPartitionCache } from "@/shared/api/spot-gateway";
import { useAuth } from "@/shared/auth/AuthContext";
import { setStoredToken } from "@/shared/auth/token-store";
import type { UserAccountItem } from "@/shared/auth/types";
import { Building2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";

const ORCA_LOGO = "https://placehold.co/240x64/0b3b98/ffffff?text=Orca";

export function ChooseCompanyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, refetchMe } = useAuth();
  const [accounts, setAccounts] = useState<UserAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const visibleAccounts = accounts.filter(([, name]) => !name.trim().startsWith("_"));
  const searchLower = search.trim().toLowerCase();
  const filtered =
    !searchLower
      ? visibleAccounts
      : visibleAccounts.filter(
          ([id, name]) =>
            name.toLowerCase().includes(searchLower) ||
            String(id).includes(searchLower)
        );

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const loginCallbackUrl = "/choose-company" + (callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchUserAccounts()
      .then((data) => {
        if (!cancelled) setAccounts(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Falha ao carregar empresas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a4a8a] to-[#0a1a3e]">
        <span className="text-white">Carregando…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?callbackUrl=${encodeURIComponent(loginCallbackUrl)}`} replace />;
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.name?.split(" ")[0] ?? "";

  const handleSelect = async (companyId: number) => {
    setSwitching(true);
    setError(null);
    try {
      const data = await switchCompany(companyId);
      setStoredToken(data.access_token);
      clearPartitionCache();
      await refetchMe();
      navigate(callbackUrl.startsWith("/") ? callbackUrl : "/", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao trocar empresa");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#0a4a8a] to-[#0a1a3e]">
      <div
        className="login-bg-layer fixed inset-0 z-0 bg-cover bg-no-repeat opacity-60"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row lg:items-stretch">
        <section className="flex min-h-0 flex-1 items-center justify-center px-6 py-10 lg:min-h-screen lg:px-10 lg:py-12">
          <div className="max-w-[500px]">
            <h1 className="text-3xl font-semibold leading-tight text-white lg:text-4xl lg:leading-[48px] lg:tracking-tight">
              Escolha a empresa que deseja acessar
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Você possui acesso a mais de uma empresa. Selecione ao lado para continuar.
            </p>
          </div>
        </section>

        <section className="hidden min-h-screen flex-1 lg:block" aria-hidden />

        <section className="flex min-h-0 flex-1 items-center justify-center px-5 py-8 lg:min-h-screen lg:px-10 lg:py-12">
          <div className="w-full max-w-[420px] rounded-3xl border border-white/35 bg-white/10 px-8 py-10 shadow-2xl backdrop-blur-xl sm:px-10 sm:py-12">
            <div className="mb-8 flex justify-center">
              <img
                src={ORCA_LOGO}
                alt="Logo Orca"
                className="h-auto w-[200px] sm:w-[220px]"
              />
            </div>
            <p className="mb-1 text-center text-sm text-white/80">
              {greeting}
              {firstName && `, ${firstName}`}
            </p>
            <h2 className="mb-6 text-center text-2xl font-semibold text-white">
              Selecione a empresa
            </h2>

            {loading && (
              <p className="text-center text-white/80">Carregando empresas…</p>
            )}
            {!loading && visibleAccounts.length === 0 && (
              <p className="text-center text-white/80">Nenhuma empresa encontrada.</p>
            )}
            {!loading && visibleAccounts.length > 0 && (
              <div className="flex min-h-[28rem] flex-col gap-3">
                <div className="relative shrink-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome ou ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 border-white/50 bg-white/90 pl-9 pr-4 text-[15px] text-neutral-900 placeholder:text-neutral-500 caret-neutral-900 focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </div>
                {filtered.length === 0 ? (
                  <p className="flex-1 py-2 text-center text-sm text-white/80">
                    Nenhuma empresa encontrada para &quot;{search}&quot;.
                  </p>
                ) : (
                  <ScrollArea className="h-[24rem]">
                    <div className="flex flex-col gap-3 pr-2">
                      {filtered.map(([id, name]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleSelect(id)}
                          disabled={switching}
                          className="flex w-full items-center gap-3 rounded-xl border border-white/35 bg-white/10 px-4 py-4 text-left text-white transition hover:bg-white/20 disabled:opacity-60"
                        >
                          <Building2 className="h-5 w-5 shrink-0 text-white/80" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium">{name}</span>
                            <span className="ml-2 text-xs text-white/60">ID {id}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
