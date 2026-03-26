export interface RenegotiationPlanUsageLimit {
  used: number;
  total: number;
  difference?: number;
}

export interface RenegotiationPlanUsageIssues {
  payment?: boolean;
  assignature?: boolean;
  metaBussiness?: boolean;
}

export interface RenegotiationPlanUsageResponse {
  planType: string;
  startDate: string;
  endDate: string | null;
  dailyConversationLimit: RenegotiationPlanUsageLimit;
  debtsLimit: RenegotiationPlanUsageLimit;
  issues?: RenegotiationPlanUsageIssues | null;
  integration?: string | null;
}

export interface RenegotiationPlanUsageParams {
  companyId: number;
}
