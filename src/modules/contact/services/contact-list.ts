import { spotJson } from "@/shared/api/http-client";
import type {
  ContactListParams,
  ContactListResponse,
} from "@/modules/contact/types/contact-list";

const CONTACT_QUERY_PATH = "/contact/query";

const DEFAULT_WHERE = {
  contractDate: {},
  conversationDate: {},
  isInBlackList: false,
};

function buildPath(params: ContactListParams): string {
  const search = new URLSearchParams({
    take: String(params.take),
    skip: String(params.skip),
    usePerson: params.usePerson === true ? "true" : "false",
    transformer: "to-frontend-list",
    pager: "true",
  });
  search.append("companyIds[]", String(params.companyId));
  search.set("where", JSON.stringify(params.where ?? DEFAULT_WHERE));
  if (params.orderBy) search.set("orderBy", String(params.orderBy));
  /** DynamicQuery / transformToDynamicQuery usam `orderByDirection`. */
  if (params.orderDirection) search.set("orderByDirection", params.orderDirection);
  return `${CONTACT_QUERY_PATH}?${search.toString()}`;
}

export async function fetchContactList(
  params: ContactListParams
): Promise<ContactListResponse> {
  return spotJson<ContactListResponse>(buildPath(params));
}
