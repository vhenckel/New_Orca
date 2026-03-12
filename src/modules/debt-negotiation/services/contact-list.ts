import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type {
  ContactListParams,
  ContactListResponse,
} from "@/modules/debt-negotiation/types/contact-list";

const CONTACT_QUERY_PATH = "/trinity/contact/query";

const DEFAULT_WHERE = {
  contractDate: {},
  conversationDate: {},
  isInBlackList: false,
};

function buildUrl(params: ContactListParams): string {
  const search = new URLSearchParams({
    take: String(params.take),
    skip: String(params.skip),
    usePerson: params.usePerson === true ? "true" : "false",
    transformer: "to-frontend-list",
    pager: "true",
  });
  search.append("companyIds[]", String(params.companyId));
  search.set("where", JSON.stringify(params.where ?? DEFAULT_WHERE));
  return `${spotApiBaseUrl}${CONTACT_QUERY_PATH}?${search.toString()}`;
}

export async function fetchContactList(
  params: ContactListParams
): Promise<ContactListResponse> {
  const url = buildUrl(params);
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Contact list API error: ${res.status}`);
  }
  return res.json();
}
