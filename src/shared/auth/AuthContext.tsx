/**
 * AuthProvider: sessão (token + usuário), login, logout e handler global de 401.
 */

/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import * as authApi from "@/shared/api/auth-api";
import { ApiError, registerUnauthorizedHandler } from "@/shared/api/http-client";
import {
  getLandingPathForPersona,
  mapApiUserToMeResponse,
  resolvePostLoginPath,
} from "@/shared/auth/api-user";
import { applyResolvedAccentColor } from "@/shared/auth/branding-accent";
import {
  getCompanyIdFromToken,
  isTokenExpired,
} from "@/shared/auth/jwt";
import { hasValidSessionToken } from "@/shared/auth/session";
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/shared/auth/token-store";
import type { LoginRequest, MeResponse } from "@/shared/auth/types";
import { getDefaultCompanyId } from "@/shared/config/env";
import { getIsViewportMobile } from "@/shared/hooks/useIsMobile";
import { toast } from "@/shared/ui/sonner";

export {
  getLandingPathForPersona,
  resolvePostLoginPath,
} from "@/shared/auth/api-user";
export type { GetLandingPathOptions } from "@/shared/auth/api-user";

export interface AuthState {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
  companyId: number;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest, redirectFrom?: string) => Promise<void>;
  logout: () => void;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function restoreUserFromStorage(): MeResponse | null {
  const apiUser = getStoredUser();
  if (!apiUser?.active) return null;
  return mapApiUserToMeResponse(apiUser);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getStoredToken();
  const companyId = token
    ? getCompanyIdFromToken(token) ?? getDefaultCompanyId()
    : getDefaultCompanyId();

  const isAuthenticated = hasValidSessionToken() && !!user;

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setError(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleUnauthorized = useCallback(() => {
    const returnTo = `${location.pathname}${location.search}`;
    clearStoredSession();
    setUser(null);
    setError(null);
    toast.error("Sessão expirada");
    navigate("/login", { replace: true, state: { from: returnTo } });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    registerUnauthorizedHandler(handleUnauthorized);
    return () => registerUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  const loadSession = useCallback(() => {
    const storedToken = getStoredToken();
    if (!storedToken || isTokenExpired(storedToken)) {
      clearStoredSession();
      setUser(null);
      setLoading(false);
      return;
    }

    const restored = restoreUserFromStorage();
    if (restored) {
      setUser(restored);
      applyResolvedAccentColor(restored);
    } else {
      clearStoredSession();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(
    async (credentials: LoginRequest, redirectFrom?: string) => {
      setLoading(true);
      setError(null);
      try {
        const { user: apiUser, accessToken } = await authApi.login(credentials);
        if (!apiUser.active) {
          throw new ApiError("Usuário ou senha inválido", 401);
        }
        setStoredToken(accessToken);
        setStoredUser(apiUser);
        const sessionUser = mapApiUserToMeResponse(apiUser);
        setUser(sessionUser);
        applyResolvedAccentColor(sessionUser);

        const from =
          redirectFrom ??
          (location.state as { from?: string } | null)?.from;
        const landing = resolvePostLoginPath(sessionUser.persona, from, {
          isMobile: getIsViewportMobile(),
        });
        navigate(landing, { replace: true });
      } catch (e) {
        const message =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Falha no login";
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [location.state, navigate],
  );

  const refetchMe = useCallback(async () => {
    const restored = restoreUserFromStorage();
    if (!restored) return;
    setUser(restored);
    applyResolvedAccentColor(restored);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      companyId,
      isAuthenticated,
      login,
      logout,
      refetchMe,
    }),
    [user, loading, error, companyId, isAuthenticated, login, logout, refetchMe],
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
