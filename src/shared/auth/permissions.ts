/**
 * Utilitários puros de autorização (hasPermission, hasModule, hasSubModule).
 * Não dependem de React nem de storage; recebem o perfil como argumento.
 */

import type { MeProfile, Module, SubModule } from "./types";

/**
 * Retorna true se o perfil tem pelo menos uma das permissões com nome em `permissionNames` e enabled.
 * Opcionalmente restringe a moduleName e/ou subModuleName.
 */
export function hasPermission(
  profile: MeProfile | null | undefined,
  permissionNames: string[],
  moduleName?: string,
  subModuleName?: string
): boolean {
  if (!profile?.modules?.length) return false;
  if (moduleName != null && subModuleName != null) {
    return profile.modules.some(
      (m) =>
        m.name === moduleName &&
        m.subModules?.some(
          (s) =>
            s.name === subModuleName &&
            s.permissions?.some((p) =>
              permissionNames.includes(p.name) && p.enabled
            )
        )
    );
  }
  return profile.modules.some((m) =>
    m.subModules?.some((s) =>
      s.permissions?.some((p) =>
        permissionNames.includes(p.name) && p.enabled
      )
    )
  );
}

/**
 * Retorna true se o perfil tem o módulo com nome moduleName.
 */
export function hasModule(
  profile: MeProfile | null | undefined,
  moduleName: string
): boolean {
  if (!profile?.modules?.length) return false;
  return profile.modules.some((m) => m.name === moduleName);
}

/**
 * Retorna true se o perfil tem o submódulo moduleName.subModuleName.
 */
export function hasSubModule(
  profile: MeProfile | null | undefined,
  moduleName: string,
  subModuleName: string
): boolean {
  if (!profile?.modules?.length) return false;
  return profile.modules.some(
    (m) =>
      m.name === moduleName &&
      m.subModules?.some((s) => s.name === subModuleName)
  );
}
