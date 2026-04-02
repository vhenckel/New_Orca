import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateChannelBody, UpdateChannelConfigBody } from "@/modules/settings/types/channel";
import {
  clearChannelCache,
  createChannel,
  updateChannelConfig,
  updateChannelWeight,
} from "@/modules/settings/services/channels";

function channelsQueryKey(companyId: number | null) {
  return ["settings", "channels", companyId] as const;
}

export function useCreateChannelMutation(companyId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateChannelBody) => createChannel(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: channelsQueryKey(companyId) });
    },
  });
}

export function useUpdateChannelWeightMutation(companyId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, weight }: { channelId: number; weight: number }) =>
      updateChannelWeight(channelId, weight),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: channelsQueryKey(companyId) });
    },
  });
}

export function useUpdateChannelConfigMutation(companyId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      channelId,
      body,
    }: {
      channelId: number;
      body: UpdateChannelConfigBody;
    }) => updateChannelConfig(channelId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: channelsQueryKey(companyId) });
    },
  });
}

export function useClearChannelCacheMutation(companyId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: number) => clearChannelCache(channelId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: channelsQueryKey(companyId) });
    },
  });
}
