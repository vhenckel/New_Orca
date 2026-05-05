import { type ReactNode, useMemo } from "react";

import { AppShell } from "@/app/layouts/AppShell";
import { MobileShell } from "@/app/layouts/MobileShell";
import { useAuth } from "@/shared/auth/AuthContext";
import { getMobileModulesForPersona, getModulesForPersona } from "@/app/router/modules";
import type { AppModuleDefinition } from "@/app/router/types";

export function ModuleShell({ module, children }: { module: AppModuleDefinition; children: ReactNode }) {
  const { user } = useAuth();
  const modules = useMemo(() => {
    if (!user) return [];
    return module.isMobile ? getMobileModulesForPersona(user.persona) : getModulesForPersona(user.persona);
  }, [user, module]);

  if (module.isMobile) {
    return <MobileShell modules={modules}>{children}</MobileShell>;
  }
  return <AppShell modules={modules}>{children}</AppShell>;
}
