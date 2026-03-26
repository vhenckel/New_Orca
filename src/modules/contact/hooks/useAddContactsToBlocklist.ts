import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addContactsToBlocklist } from "@/modules/contact/services/contact-blocklist";
import type { AddContactsToBlocklistInput } from "@/modules/contact/types/contact-blacklist-actions";

interface UseAddContactsToBlocklistOptions {
  anchorContactId: number;
}

export function useAddContactsToBlocklist({
  anchorContactId,
}: UseAddContactsToBlocklistOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddContactsToBlocklistInput) =>
      addContactsToBlocklist(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["contact", "person-cluster", anchorContactId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["contact", "details", anchorContactId],
      });
    },
  });
}
