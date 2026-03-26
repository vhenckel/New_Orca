export interface ContactMetricsValues {
  conversations: number;
  simulations: number;
  services: number;
  contracts: number;
  products: number;
}

export interface ContactMetricsResponse {
  dateFirstConversation: string | null;
  dateLastConversation: string | null;
  metrics: ContactMetricsValues;
}

