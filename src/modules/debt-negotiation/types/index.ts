export interface PortfolioBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface KpiMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  percentage?: string;
  delay?: number;
}

export interface OperationalMetric {
  label: string;
  value: string;
  subtitle?: string;
  delay?: number;
}

export type {
  RenegotiationBoxesResponse,
  RenegotiationBoxesParams,
} from "./renegotiation-boxes";
export type {
  ContactListItem,
  ContactListResponse,
  ContactListParams,
} from "./contact-list";
export type { ContactDetails } from "./contact-detail";
export type { ContactMetricsResponse } from "./contact-metrics";
export type { ContactDebtsResponse, ContactDebtItem } from "./contact-debts";
export type { ContactActivitiesResponse, ContactActivity } from "./contact-activities";
export type { ContactCampaignsResponse, ContactCampaign } from "./contact-campaigns";
export type {
  DebtDetailsItem,
  DebtDetailsResponse,
  DebtDetailsParams,
} from "./debt-details";
