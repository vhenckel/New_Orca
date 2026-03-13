import { useQuery } from "@tanstack/react-query";
import { fetchContactList } from "@/modules/debt-negotiation/services/contact-list";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

const PAGE_SIZE = 15;

interface UseContactListParams {
  page?: number;
  companyId?: number;
  /** Texto digitado no campo de busca (keyword da API). */
  search?: string;
}

export function useContactList(params?: UseContactListParams) {
  const page = params?.page ?? 1;
  const companyId = params?.companyId ?? getCurrentCompanyId();
  const skip = (page - 1) * PAGE_SIZE;
  const rawSearch = params?.search?.trim() ?? "";
  const hasSearch = rawSearch.length > 0;

  return useQuery({
    queryKey: ["contacts", "list", companyId, page, hasSearch ? rawSearch : undefined],
    queryFn: () =>
      fetchContactList({
        take: PAGE_SIZE,
        skip,
        companyId,
        where: {
          contractDate: {},
          conversationDate: {},
          isInBlackList: false,
          ...(hasSearch ? { keyword: rawSearch } : {}),
        },
      }),
  });
}

export { PAGE_SIZE as CONTACT_LIST_PAGE_SIZE };
