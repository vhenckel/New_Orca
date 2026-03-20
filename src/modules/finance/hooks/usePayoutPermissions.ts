import { useMemo } from "react";

import { useAuth } from "@/shared/auth/AuthContext";
import { hasPermission, hasSubModule } from "@/shared/auth/permissions";

const PAYOUT_SUBMODULE = "conciliacao_de_pagamentos";
const PAYOUT_LINK = "/setup/payout";

export function usePayoutPermissions() {
  const { user } = useAuth();
  const profile = user?.profile;

  return useMemo(() => {
    const inPayoutSubmodule = !!profile && (
      hasSubModule(profile, "dividas", PAYOUT_SUBMODULE) ||
      hasSubModule(profile, "dívidas", PAYOUT_SUBMODULE) ||
      profile.modules.some((module) =>
        module.subModules?.some((subModule) => subModule.link === PAYOUT_LINK),
      )
    );

    const check = (permissionNames: string[]) => {
      if (!profile) return true;
      if (!inPayoutSubmodule) return false;
      return (
        hasPermission(profile, permissionNames, "dividas", PAYOUT_SUBMODULE) ||
        hasPermission(profile, permissionNames, "dívidas", PAYOUT_SUBMODULE)
      );
    };

    return {
      canViewPage: check(["visualizar"]),
      canViewDetails: check(["detalhes"]),
      canEdit: check(["editar"]),
      canViewReconciliation: check(["detalhes_conciliacao"]),
      canExport: check(["exportar_conciliacao"]),
    };
  }, [profile]);
}
