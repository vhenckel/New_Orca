import { useQuery } from "@tanstack/react-query";
import { fetchContactList } from "@/modules/debt-negotiation/services/contact-list";
import { getDefaultCompanyId } from "@/shared/config/env";

const PAGE_SIZE = 15;

export function useContactList(params?: { page?: number; companyId?: number }) {
  const page = params?.page ?? 1;
  const companyId = params?.companyId ?? getDefaultCompanyId();
  const skip = (page - 1) * PAGE_SIZE;

  return useQuery({
    queryKey: ["contacts", "list", companyId, page],
    queryFn: () =>
      fetchContactList({
        take: PAGE_SIZE,
        skip,
        companyId,
      }),
  });
}

export { PAGE_SIZE as CONTACT_LIST_PAGE_SIZE };
