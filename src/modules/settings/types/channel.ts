/** Tipos alinhados a docs/setup.md §5–6 e API SPOT. */

export interface ChannelMetrics {
  messagesToday?: number;
  messagesThisMinute?: number;
  usagePercent?: number;
  errorRate?: number;
  successRate?: number;
}

export interface ChannelModel {
  id: number;
  name: string;
  phoneNumber?: string | null;
  phoneNumberId?: string | null;
  weight: number;
  templateDailyLimit?: number | null;
  messagesPerMinute?: number | null;
  campaignIn?: boolean | null;
  companyIdPreferred?: number | null;
  botIdPreferred?: number | null;
  channelTypeId?: number | null;
  connectionId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  blockedMessageTypes?: string[] | null;
  metrics?: ChannelMetrics | null;
}

export interface ChannelListSummary {
  totalChannels?: number;
  activeChannels?: number;
  totalMessagesToday?: number;
  averageSuccessRate?: number;
  channelsAtCapacity?: number;
  totalBlockedMessagesToday?: number;
}

export interface ChannelListResponse {
  channels: ChannelModel[];
  summary?: ChannelListSummary | null;
}

export interface CreateChannelBody {
  name: string;
  phoneNumberId: string;
  phoneNumber: string;
  weight: number;
  templateDailyLimit: number;
  messagesPerMinute: number;
  companyId: number;
  botId: number;
  blockedMessageTypes?: string[];
  connectionToken: string;
  connectionUrl: string;
}

export interface UpdateChannelConfigBody {
  weight?: number;
  templateDailyLimit?: number;
  messagesPerMinute?: number;
  blockedMessageTypes?: string[];
}

export interface BotDto {
  id: number;
  name?: string;
}
