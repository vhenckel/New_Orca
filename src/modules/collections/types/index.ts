export interface CollectionChargeSummary {
  status: string;
  total: number;
}

export interface CollectionContact {
  id: string;
  name: string;
  lastInteractionAt?: string;
}
