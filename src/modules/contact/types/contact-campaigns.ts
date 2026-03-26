export interface ContactCampaign {
  campaignId: string;
  campaignType: string;
  campaignName: string;
  productName: string | null;
  sendCount: string;
  lastConversationDate: string | null;
}

export interface ContactCampaignsResponse {
  campaigns: ContactCampaign[];
  originCampaign: unknown | null;
}

