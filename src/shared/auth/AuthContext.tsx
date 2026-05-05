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
import type { LoginRequest, MeResponse, UserPersona } from "@/shared/auth/types";
import { applyResolvedAccentColor } from "@/shared/auth/branding-accent";
import { getIsViewportMobile } from "@/shared/hooks/useIsMobile";

/**
 * Mapa hardcoded de email → persona, usado enquanto não temos a API do Orca.
 * Qualquer outro email cai no fallback `buyer`.
 */
const PERSONA_BY_EMAIL: Record<string, UserPersona> = {
  "restaurante@orca.com.br": "buyer",
  "fornecedor@orca.com.br": "supplier",
};

function resolvePersonaFromEmail(email: string | undefined): UserPersona {
  if (!email) return "buyer";
  return PERSONA_BY_EMAIL[email.trim().toLowerCase()] ?? "buyer";
}

export interface GetLandingPathOptions {
  /** Quando true, fornecedor cai em `/m/supplier/quotations` (fluxo mobile). */
  isMobile?: boolean;
}

/** Landing pós-login por persona. */
export function getLandingPathForPersona(
  persona: UserPersona,
  options?: GetLandingPathOptions,
): string {
  if (persona === "supplier" && options?.isMobile) {
    return "/m/supplier/quotations";
  }
  return persona === "supplier" ? "/supplier/dashboard" : "/dashboard";
}

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
  persona: "buyer",
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
    async (credentials: LoginRequest) => {
      const email = credentials.username.trim();
      if (!email) {
        setError("Informe um e-mail válido.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const persona = resolvePersonaFromEmail(email);
        const sessionUser: MeResponse = {
          ...LOCAL_USER,
          persona,
          email: email || LOCAL_USER.email,
          username: email || LOCAL_USER.username,
        };
        setUser(sessionUser);
        applyResolvedAccentColor(sessionUser);
        const landing = getLandingPathForPersona(persona, {
          isMobile: getIsViewportMobile(),
        });
        navigate(landing, { replace: true });
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
