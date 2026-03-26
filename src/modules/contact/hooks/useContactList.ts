import { useQuery } from "@tanstack/react-query";
import { fetchContactList } from "@/modules/contact/services/contact-list";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

/** Padrão alinhado a `usePaginationQueryState` (DataTable). */
const DEFAULT_PAGE_SIZE = 10;

interface UseContactListParams {
  page?: number;
  pageSize?: number;
  companyId?: number;
  /** Texto digitado no campo de busca (keyword da API). */
  search?: string;
}

export function useContactList(params?: UseContactListParams) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? DEFAULT_PAGE_SIZE;
  const companyId = params?.companyId ?? getCurrentCompanyId();
  const skip = (page - 1) * pageSize;
  const rawSearch = params?.search?.trim() ?? "";
  const hasSearch = rawSearch.length > 0;

  return useQuery({
    queryKey: [
      "contacts",
      "list",
      companyId,
      page,
      pageSize,
      hasSearch ? rawSearch : undefined,
      "usePerson",
    ],
    queryFn: () =>
      fetchContactList({
        take: pageSize,
        skip,
        companyId,
        usePerson: true,
        where: {
          contractDate: {},
          conversationDate: {},
          isInBlackList: false,
          ...(hasSearch ? { keyword: rawSearch } : {}),
        },
      }),
  });
}

export { DEFAULT_PAGE_SIZE as CONTACT_LIST_PAGE_SIZE };
