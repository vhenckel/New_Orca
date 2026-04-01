import { useQuery } from "@tanstack/react-query";

import type { ChannelListResponse } from "@/modules/settings/types/channel";
import { fetchChannelsList } from "@/modules/settings/services/channels";

export function useChannelsQuery(companyId: number | null) {
  return useQuery<ChannelListResponse>({
    queryKey: ["settings", "channels", companyId],
    queryFn: () => {
      if (companyId == null) throw new Error("companyId is required");
      return fetchChannelsList(companyId);
    },
    enabled: companyId != null,
  });
}
