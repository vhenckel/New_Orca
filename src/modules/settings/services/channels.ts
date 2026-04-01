import { spotFetch, spotJson } from "@/shared/api/http-client";

import type {
  BotDto,
  ChannelListResponse,
  ChannelModel,
  CreateChannelBody,
  UpdateChannelConfigBody,
} from "@/modules/settings/types/channel";

function channelsListUrl(companyId: number): string {
  return `/channel/admin/channels?companyId=${companyId}`;
}

function botsListUrl(companyId: number): string {
  return `/bot/admin/bots?companyId=${companyId}`;
}

function normalizeBotsResponse(
  raw: BotDto[] | { bots?: BotDto[]; data?: BotDto[] } | null | undefined,
): BotDto[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    if (Array.isArray(raw.bots)) return raw.bots;
    if (Array.isArray(raw.data)) return raw.data;
  }
  return [];
}

export async function fetchChannelsList(companyId: number): Promise<ChannelListResponse> {
  const raw = await spotJson<unknown>(channelsListUrl(companyId));
  if (Array.isArray(raw)) {
    return { channels: raw as ChannelModel[], summary: null };
  }
  if (raw && typeof raw === "object" && "channels" in raw) {
    return raw as ChannelListResponse;
  }
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    raw.data &&
    typeof raw.data === "object" &&
    "channels" in raw.data
  ) {
    return raw.data as ChannelListResponse;
  }
  return { channels: [], summary: null };
}

export async function fetchChannelBots(companyId: number): Promise<BotDto[]> {
  const raw = await spotJson<BotDto[] | { bots?: BotDto[]; data?: BotDto[] }>(botsListUrl(companyId));
  return normalizeBotsResponse(raw);
}

export async function createChannel(body: CreateChannelBody): Promise<void> {
  const res = await spotFetch("/channel/admin/channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function updateChannelWeight(channelId: number, weight: number): Promise<void> {
  const res = await spotFetch(`/channel/admin/channels/${channelId}/weight`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weight }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function updateChannelConfig(
  channelId: number,
  body: UpdateChannelConfigBody,
): Promise<void> {
  const res = await spotFetch(`/channel/admin/channels/${channelId}/config`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function clearChannelCache(channelId: number): Promise<void> {
  const res = await spotFetch(`/channel/admin/channels/${channelId}/clear-cache`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
