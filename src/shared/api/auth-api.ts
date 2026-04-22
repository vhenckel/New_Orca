import type { SwitchCompanyResponse, UserAccountItem } from "@/shared/auth/types";

const MOCK_ACCOUNTS: UserAccountItem[] = [
  [316, "Orca Matriz", "ORCA-MATRIZ"],
  [481, "Orca Filial Centro", "ORCA-CENTRO"],
  [902, "Orca Filial Sul", "ORCA-SUL"],
];

function createMockToken(companyId: number, companyName: string, companyExternalId: string): string {
  const payload = {
    cmpid: companyId,
    companyName,
    companyExternalId,
    sub: "local-user",
  };
  return `mock.${btoa(JSON.stringify(payload))}.token`;
}

/** Mock local para seleção de empresa enquanto API não estiver disponível. */
export async function fetchUserAccounts(): Promise<UserAccountItem[]> {
  return Promise.resolve(MOCK_ACCOUNTS);
}

/** Mock local para troca de empresa. Retorna token compatível com parser local. */
export async function switchCompany(companyId: number): Promise<SwitchCompanyResponse> {
  const account = MOCK_ACCOUNTS.find(([id]) => id === companyId) ?? MOCK_ACCOUNTS[0];
  const [id, name, externalId] = account;
  return Promise.resolve({
    access_token: createMockToken(id, name, externalId),
  });
}
