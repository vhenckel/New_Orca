import type { ChannelModel } from "@/modules/settings/types/channel";

export type ChannelRowStatus = "paused" | "at_limit" | "near_limit" | "warmup" | "normal";

/** Ordem de avaliação alinhada a docs/setup.md §9. */
export function getChannelRowStatus(channel: ChannelModel): ChannelRowStatus {
  if (channel.weight === 0) return "paused";
  const usage = channel.metrics?.usagePercent;
  if (usage != null && usage >= 100) return "at_limit";
  if (usage != null && usage > 80) return "near_limit";
  if (channel.weight < 30) return "warmup";
  return "normal";
}
