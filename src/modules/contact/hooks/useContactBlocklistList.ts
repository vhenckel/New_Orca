import { useQuery } from "@tanstack/react-query";

import {
  fetchContactBlocklistList,
} from "@/modules/contact/services/contact-blocklist";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

export const CONTACT_BLOCKLIST_QUERY_KEY = "contacts-blocklist-list" as const;

interface UseContactBlocklistListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export function useContactBlocklistList(params: UseContactBlocklistListParams) {
  const companyId = getCurrentCompanyId();
  const skip = (params.page - 1) * params.pageSize;
  const rawSearch = params.search?.trim() ?? "";
  const hasSearch = rawSearch.length > 0;

  return useQuery({
    queryKey: [
      CONTACT_BLOCKLIST_QUERY_KEY,
      companyId,
      params.page,
      params.pageSize,
      hasSearch ? rawSearch : undefined,
    ],
    queryFn: () =>
      fetchContactBlocklistList({
        companyId,
        take: params.pageSize,
        skip,
        ...(hasSearch ? { keyword: rawSearch } : {}),
      }),
  });
}
