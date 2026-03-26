import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotFetch, spotJson } from "@/shared/api/http-client";
import type {
  PersonContactClusterResponse,
  PersonDetailsResponse,
} from "@/modules/contact/types/person-contact";

const BASE = "/contact/person";

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(j.message)) return j.message.join(", ");
    if (typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return `Erro ${res.status}`;
}

/** Cluster 1 pessoa → N contatos a partir de um contato âncora. */
export async function fetchPersonContactQuery(
  contactId: number,
  companyId: number = getCurrentCompanyId(),
): Promise<PersonContactClusterResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(companyId));
  search.append("contactId", String(contactId));
  return spotJson<PersonContactClusterResponse>(
    `${BASE}/query?${search.toString()}`,
  );
}

export async function fetchPersonDetails(
  personId: number,
  companyId: number = getCurrentCompanyId(),
): Promise<PersonDetailsResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(companyId));
  return spotJson<PersonDetailsResponse>(
    `${BASE}/${personId}/details?${search.toString()}`,
  );
}

/** POST /contact/person/main — define qual contato (linha WhatsApp) é o principal na pessoa. */
export async function setPersonMainContact(
  contactId: number,
  companyId: number = getCurrentCompanyId(),
): Promise<void> {
  const search = new URLSearchParams();
  search.append("companyIds", String(companyId));
  const res = await spotFetch(`${BASE}/main?${search.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactId }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

/** POST /contact/person/unlink — desvincula um contato da pessoa pelo contato âncora. */
export async function unlinkPersonContact(
  contactId: number,
  anchorContactId: number,
  companyId: number = getCurrentCompanyId(),
): Promise<{ unlinked: boolean; softDeleted: boolean }> {
  const search = new URLSearchParams();
  search.append("companyIds", String(companyId));
  const res = await spotFetch(`${BASE}/unlink?${search.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactId, anchorContactId }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<{ unlinked: boolean; softDeleted: boolean }>;
}
