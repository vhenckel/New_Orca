/**
 * AuthProvider: sessão (token + /me), login, logout, e registro de onUnauthorized para 401.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useNavigate } from "react-router-dom";

import { setHttpClientOnUnauthorized } from "@/shared/api/http-client";
import { clearPartitionCache } from "@/shared/api/spot-gateway";
import { getDefaultCompanyId } from "@/shared/config/env";
import { getCompanyIdFromToken } from "@/shared/auth/jwt";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/shared/auth/token-store";
import type { LoginRequest, MeResponse } from "@/shared/auth/types";
import { fetchUserAccounts } from "@/shared/api/auth-api";
import { spotJson } from "@/shared/api/http-client";

export interface AuthState {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
  companyId: number;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest, options?: { callbackUrl?: string }) => Promise<void>;
  logout: () => void;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_BRANDING = {
  image: "https://assets.o2ospot.com/spot/icons/o2ospot.svg",
  color: "#096dd9",
};

async function fetchMe(companyId: number): Promise<MeResponse> {
  const data = await spotJson<MeResponse>(`/me?companyId=${companyId}`);
  if (!data.branding) (data as MeResponse).branding = DEFAULT_BRANDING;
  return data;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = user
    ? getCompanyIdFromToken(getStoredToken() ?? "") ?? getDefaultCompanyId()
    : getDefaultCompanyId();

  const logout = useCallback(() => {
    clearStoredToken();
    clearPartitionCache();
    setUser(null);
    setError(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setHttpClientOnUnauthorized(logout);
    return () => setHttpClientOnUnauthorized(null);
  }, [logout]);
  const loadSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cid = getCompanyIdFromToken(token) ?? getDefaultCompanyId();
      const me = await fetchMe(cid);
      setUser(me);
    } catch (e) {
      clearStoredToken();
      setUser(null);
      setError(e instanceof Error ? e.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(
    async (credentials: LoginRequest, options?: { callbackUrl?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const { spotApiBaseUrl } = await import("@/shared/config/env");
        const res = await fetch(`${spotApiBaseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(credentials.tokenRecaptcha
              ? { "Token-Recaptcha": credentials.tokenRecaptcha }
              : {}),
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
          credentials: "omit",
        });
        const data = await res.json();
        if (data.status === 429) throw new Error("Muitas tentativas, tente novamente mais tarde!");
        if (res.status === 401 && data.message === "invalid_captcha")
          throw new Error("Captcha inválido!");
        if (!data.access_token) throw new Error(data.message ?? "Usuário e/ou senha inválido(s)!");
        setStoredToken(data.access_token);
        const cid =
          getCompanyIdFromToken(data.access_token) ?? getDefaultCompanyId();
        const me = await fetchMe(cid);
        setUser(me);
        const target = options?.callbackUrl && options.callbackUrl.startsWith("/") ? options.callbackUrl : "/";
        const accounts = await fetchUserAccounts();
        if (accounts.length > 1) {
          const url = target === "/" ? "/choose-company" : `/choose-company?callbackUrl=${encodeURIComponent(target)}`;
          navigate(url, { replace: true });
        } else {
          navigate(target, { replace: true });
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Login failed"
        );
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const refetchMe = useCallback(async () => {
    const token = getStoredToken();
    if (!token || !user) return;
    const cid = getCompanyIdFromToken(token) ?? getDefaultCompanyId();
    const me = await fetchMe(cid);
    setUser(me);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      companyId,
      isAuthenticated: !!user,
      login,
      logout,
      refetchMe,
    }),
    [user, loading, error, companyId, login, logout, refetchMe]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
