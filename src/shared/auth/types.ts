/**
 * Contratos de sessão, /me e árvore de permissões.
 * Alinhado ao management (OutputUserTeam, ProfileModel, Module/SubModule/UserPermission).
 */

/** Permissão no perfil (nome, label, enabled). */
export interface UserPermission {
  name: string;
  label: string;
  enabled: boolean;
  icon?: string;
  basePath?: string;
  show?: boolean;
}

/** Submódulo com lista de permissões. */
export interface SubModule {
  name: string;
  label: string;
  link?: string;
  enabled?: boolean;
  permissions: UserPermission[];
}

/** Módulo (estende UserPermission) com submódulos. */
export interface Module {
  name: string;
  label: string;
  enabled: boolean;
  basePath?: string;
  subModules?: SubModule[];
}

/** Perfil do usuário (vindo do /me). */
export interface MeProfile {
  id: string;
  name: string;
  mask: string;
  isActive: boolean;
  isSystem: boolean;
  updatedByUserId: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  roleId: string;
  companyRoleId: string;
  companyUserId: string;
  profileId: string;
  businessAreaId: string;
  modules: Module[];
}

/** Branding opcional retornado pelo /me. */
export interface BrandingConfig {
  image: string;
  color: string;
}

/** Resposta do GET /me (OutputUserTeam). id = company_user.id; userId = user.id (usar para /auth/accounts). */
export interface MeResponse {
  id: number;
  userId?: number;
  name: string;
  businessArea: string | unknown;
  profile: MeProfile;
  lastAccess: string;
  modules: Module[];
  maxNumberOfClients: number;
  branding?: BrandingConfig;
  userStatuses?: Array<{ statusId: number }>;
  /** Features da conta (ex.: role "Super Admin"), quando retornadas pelo /me — alinhado ao management. */
  features?: Array<{ name: string }>;
}

/** Payload do POST /auth/login. */
export interface LoginRequest {
  username: string;
  password: string;
  tokenRecaptcha?: string;
}

/** Resposta do POST /auth/login. */
export interface LoginResponse {
  access_token: string;
  status?: number;
  message?: string;
}

/** Item retornado por GET /auth/accounts: [companyId, companyName, companyExternalId]. */
export type UserAccountItem = [number, string, string];

/** Resposta do POST /auth/switch-company. */
export interface SwitchCompanyResponse {
  access_token: string;
}

/** Claims úteis do JWT (decode client-side para companyId, etc.). Alinhado ao payload do spot-api (PayloadAccessToken). */
export interface TokenClaims {
  sub?: string;
  cmpid?: number;
  companyName?: string;
  companyExternalId?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/** Sessão no frontend: token + usuário (/me) + companyId. */
export interface AuthSession {
  accessToken: string;
  user: MeResponse;
  companyId: number;
}
