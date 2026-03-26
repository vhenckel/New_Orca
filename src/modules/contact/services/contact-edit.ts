import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotFetch } from "@/shared/api/http-client";
import type {
  ContactEntityForEdit,
  ContactFieldsResponse,
} from "@/modules/contact/types/contact-edit";

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

export async function fetchContactFields(): Promise<ContactFieldsResponse> {
  const res = await spotFetch("/contact/fields");
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<ContactFieldsResponse>;
}

export async function fetchContactForEdit(contactId: number): Promise<ContactEntityForEdit> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getCurrentCompanyId()));
  const res = await spotFetch(`/contact/${contactId}?${search.toString()}`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<ContactEntityForEdit>;
}

export interface SaveContactResponse {
  id: number;
}

/** POST /contact?mode=create — novo registro por WhatsApp. */
export async function createContact(
  body: Record<string, unknown>,
): Promise<SaveContactResponse> {
  const res = await spotFetch(`/contact?mode=create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<SaveContactResponse>;
}

/** PUT /contact/:id?mode=update */
export async function updateContact(
  contactId: number,
  body: Record<string, unknown>,
): Promise<SaveContactResponse> {
  const res = await spotFetch(`/contact/${contactId}?mode=update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<SaveContactResponse>;
}
