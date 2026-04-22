/**
 * AuthProvider: sessão (token + /me), login, logout, e registro de onUnauthorized para 401.
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
import { useNavigate } from "react-router-dom";

import { getDefaultCompanyId } from "@/shared/config/env";
import { getCompanyIdFromToken } from "@/shared/auth/jwt";
import {
  clearStoredToken,
  getStoredToken,
} from "@/shared/auth/token-store";
import type { LoginRequest, MeResponse } from "@/shared/auth/types";
import { applyResolvedAccentColor } from "@/shared/auth/branding-accent";

export interface AuthState {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
  companyId: number;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_BRANDING = {
  image: "",
  color: "#096dd9",
};

const LOCAL_USER: MeResponse = {
  id: 1,
  userId: 1,
  email: "usuario@orca.app",
  username: "usuario@orca.app",
  name: "Usuario ORCA",
  businessArea: "Compras",
  profile: {
    id: "local-profile",
    name: "Administrador",
    mask: "admin",
    isActive: true,
    isSystem: false,
    updatedByUserId: "local",
    createdByUserId: "local",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roleId: "local-role",
    companyRoleId: "local-company-role",
    companyUserId: "local-company-user",
    profileId: "local-profile",
    businessAreaId: "local-business",
    modules: [],
  },
  lastAccess: new Date().toISOString(),
  modules: [],
  maxNumberOfClients: 0,
  branding: DEFAULT_BRANDING,
  features: [],
};

async function fetchMe(_companyId: number): Promise<MeResponse> {
  return Promise.resolve(LOCAL_USER);
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
    setUser(null);
    setError(null);
    navigate("/login", { replace: true });
  }, [navigate]);
  const loadSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const me = await fetchMe(getCompanyIdFromToken(token) ?? getDefaultCompanyId());
      setUser(me);
      applyResolvedAccentColor(me);
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
    async (_credentials: LoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        setUser(LOCAL_USER);
        applyResolvedAccentColor(LOCAL_USER);
        navigate("/dashboard", { replace: true });
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
    applyResolvedAccentColor(me);
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
