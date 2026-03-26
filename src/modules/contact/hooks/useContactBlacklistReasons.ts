import { useQuery } from "@tanstack/react-query";

import { fetchContactBlacklistReasons } from "@/modules/contact/services/contact-blocklist";

export const CONTACT_BLACKLIST_REASONS_QUERY_KEY = "contact-blacklist-reasons" as const;

export function useContactBlacklistReasons(enabled = true) {
  return useQuery({
    queryKey: [CONTACT_BLACKLIST_REASONS_QUERY_KEY],
    queryFn: fetchContactBlacklistReasons,
    enabled,
  });
}
