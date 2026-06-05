import { matchPath } from "react-router-dom";

import {
  adminModules,
  buyerModules,
  sharedModules,
  supplierMobileModules,
  supplierModules,
} from "@/app/router/modules";
import type { AppModuleDefinition } from "@/app/router/types";

import type { ApiUser, ApiUserRole, MeResponse, UserPersona } from "./types";

const ALL_MODULES: AppModuleDefinition[] = [
  ...buyerModules,
  ...supplierModules,
  ...supplierMobileModules,
  ...adminModules,
  ...sharedModules,
];

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/logout",
  "/esqueci-minha-senha",
  "/forgot-password",
  "/reset-password",
] as const;

const LOCAL_PROFILE_STUB: MeResponse["profile"] = {
  id: "session-profile",
  name: "Usuário",
  mask: "user",
  isActive: true,
  isSystem: false,
  updatedByUserId: "session",
  createdByUserId: "session",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  roleId: "session",
  companyRoleId: "session",
  companyUserId: "session",
  profileId: "session",
  businessAreaId: "session",
  modules: [],
};

export function roleToPersona(role: ApiUserRole): UserPersona {
  if (role === "admin") return "admin";
  if (role === "supplier") return "supplier";
  return "buyer";
}

export function mapApiUserToMeResponse(user: ApiUser): MeResponse {
  const persona = roleToPersona(user.role);
  return {
    id: 0,
    persona,
    email: user.email,
    username: user.email,
    name: user.name,
    businessArea: "",
    profile: {
      ...LOCAL_PROFILE_STUB,
      name: user.name,
      mask: user.role,
      isActive: user.active,
    },
    lastAccess: new Date().toISOString(),
    modules: [],
    maxNumberOfClients: 0,
  };
}

export interface GetLandingPathOptions {
  isMobile?: boolean;
}

/** Destino padrão pós-login (dashboard da persona). */
export function getLandingPathForPersona(
  persona: UserPersona,
  options?: GetLandingPathOptions,
): string {
  if (persona === "admin") return "/admin/dashboard";
  if (persona === "supplier") {
    return options?.isMobile ? "/m/supplier/quotations" : "/supplier/dashboard";
  }
  return "/dashboard";
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isSafeInternalPath(path: string): boolean {
  const pathname = path.split("?")[0]?.split("#")[0] ?? "";
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return false;
  return !isPublicPath(pathname);
}

function isPathAllowedForPersona(pathname: string, persona: UserPersona): boolean {
  for (const module of ALL_MODULES) {
    const matched = module.routes.some((route) =>
      matchPath({ path: route.path, end: true }, pathname) ||
      matchPath({ path: route.path, end: false }, pathname),
    );
    if (!matched) continue;
    if (!module.allowedPersonas?.length) return true;
    return module.allowedPersonas.includes(persona);
  }
  return false;
}

/** Valida `from` da navegação e retorna destino seguro pós-login. */
export function resolvePostLoginPath(
  persona: UserPersona,
  from: string | undefined,
  options?: GetLandingPathOptions,
): string {
  const fallback = getLandingPathForPersona(persona, options);
  if (!from || !isSafeInternalPath(from)) return fallback;

  const pathname = from.split("?")[0]?.split("#")[0] ?? "";
  if (!isPathAllowedForPersona(pathname, persona)) return fallback;
  return from;
}
