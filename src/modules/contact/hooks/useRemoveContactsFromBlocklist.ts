import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONTACT_BLOCKLIST_QUERY_KEY } from "./useContactBlocklistList";
import { removeContactsFromBlocklist } from "@/modules/contact/services/contact-blocklist";

export function useRemoveContactsFromBlocklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactIds: number[]) => removeContactsFromBlocklist(contactIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [CONTACT_BLOCKLIST_QUERY_KEY],
      });
    },
  });
}
