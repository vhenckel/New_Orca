import { useQuery } from "@tanstack/react-query";

import type { BotDto } from "@/modules/settings/types/channel";
import { fetchChannelBots } from "@/modules/settings/services/channels";

export function useChannelBotsQuery(companyId: number | null) {
  return useQuery<BotDto[]>({
    queryKey: ["settings", "channel-bots", companyId],
    queryFn: () => {
      if (companyId == null) throw new Error("companyId is required");
      return fetchChannelBots(companyId);
    },
    enabled: companyId != null,
  });
}
