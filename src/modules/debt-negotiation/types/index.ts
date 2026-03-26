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
  /** Drill-down da listagem (primeiros 3 KPIs do dashboard). */
  drilldownPath?: string;
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
  PersonContactClusterResponse,
  PersonContactListItem,
  PersonDetailsPayload,
  PersonDetailsResponse,
  PersonContactQueryParams,
  ContactDetails,
  ContactMetricsResponse,
  ContactDebtsResponse,
  ContactDebtItem,
  ContactActivitiesResponse,
  ContactActivity,
  ContactCampaignsResponse,
  ContactCampaign,
} from "@/modules/contact/types";
export type {
  DebtDetailsItem,
  DebtDetailsResponse,
  DebtDetailsParams,
} from "./debt-details";
export type {
  DebtImportFieldDefinition,
  DebtImportParseResponse,
  DebtImportValidateResponse,
  DebtImportResult,
  DebtImportValidationRow,
} from "./debt-import";
