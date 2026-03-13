/**
 * Chamadas de auth: contas do usuário e troca de empresa.
 * Usam spotFetch/spotJson (baseUrl sem gatekeeper para /auth/accounts e /auth/switch-company).
 */

import { spotJson } from "@/shared/api/http-client";
import type { UserAccountItem, SwitchCompanyResponse } from "@/shared/auth/types";

/** GET /auth/accounts – lista empresas do usuário (userId vem do JWT no backend). */
export async function fetchUserAccounts(): Promise<UserAccountItem[]> {
  const data = await spotJson<UserAccountItem[]>(`/auth/accounts`);
  return Array.isArray(data) ? data : [];
}

export async function switchCompany(companyId: number): Promise<SwitchCompanyResponse> {
  return spotJson<SwitchCompanyResponse>("/auth/switch-company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId }),
  });
}
