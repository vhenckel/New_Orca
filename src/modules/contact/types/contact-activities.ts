export interface ContactActivity {
  eventDate: string;
  eventName: string;
  subtype_id: string;
  contractId: string | null;
  extras: Record<string, unknown>;
}

export interface ContactActivitiesResponse {
  data: ContactActivity[];
  total: number;
  count: number;
}

