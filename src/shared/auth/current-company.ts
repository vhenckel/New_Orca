/**
 * CompanyId atual: token (após login/troca de empresa) ou fallback para env.
 * Usar em serviços/hooks para que a troca de empresa reflita em todas as chamadas.
 */

import { getCompanyIdFromToken } from "@/shared/auth/jwt";
import { getStoredToken } from "@/shared/auth/token-store";
import { getDefaultCompanyId } from "@/shared/config/env";

export function getCurrentCompanyId(): number {
  const token = getStoredToken();
  const fromToken = token ? getCompanyIdFromToken(token) : null;
  return fromToken ?? getDefaultCompanyId();
}
