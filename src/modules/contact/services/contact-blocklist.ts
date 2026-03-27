import { spotJson } from "@/shared/api/http-client";
import type {
  AddContactsToBlocklistInput,
  AddContactsToBlocklistResponse,
  ContactBlacklistReason,
} from "@/modules/contact/types/contact-blacklist-actions";
import type {
  ContactBlocklistListParams,
  ContactBlocklistListResponse,
  RemoveContactsFromBlocklistResponse,
} from "@/modules/contact/types/contact-blocklist";

export async function fetchContactBlocklistList(
  params: ContactBlocklistListParams,
): Promise<ContactBlocklistListResponse> {
  const companyId = params.companyId;
  const body: Record<string, unknown> = {
    companyIds: [companyId],
    take: params.take,
    skip: params.skip,
    pager: true,
  };
  if (params.keyword?.trim()) {
    body.where = { keyword: params.keyword.trim() };
  }
  if (params.orderBy) body.orderBy = String(params.orderBy);
  /** DynamicQuery no spot-api usa `orderByDirection`, não `orderDirection`. */
  if (params.orderDirection) body.orderByDirection = params.orderDirection;

  return spotJson<ContactBlocklistListResponse>("/contact-black-list/list-grid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function removeContactsFromBlocklist(
  contactIds: number[],
): Promise<RemoveContactsFromBlocklistResponse> {
  return spotJson<RemoveContactsFromBlocklistResponse>(
    "/contact-black-list/remove-black-list",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactIds }),
    },
  );
}

export async function fetchContactBlacklistReasons(): Promise<
  ContactBlacklistReason[]
> {
  return spotJson<ContactBlacklistReason[]>(
    "/contact-black-list/list-black-list-reasons",
  );
}

export async function addContactsToBlocklist(
  input: AddContactsToBlocklistInput,
): Promise<AddContactsToBlocklistResponse> {
  return spotJson<AddContactsToBlocklistResponse>(
    "/contact-black-list/add-black-list",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}
