import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotJson } from "@/shared/api/http-client";
import type { ContactDebtsResponse } from "@/modules/debt-negotiation/types";

export async function fetchContactDebts(contactId: number): Promise<ContactDebtsResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getCurrentCompanyId()));
  return spotJson<ContactDebtsResponse>(
    `/renegotiation/contact/${contactId}/debts?${search.toString()}`
  );
}

