export type OpenQuotationStatus = "open" | "sent" | "no_offer";

export type OpenQuotationSortField = "name" | "deadline";

export type SortOrder = "ASC" | "DESC";

export const OPEN_QUOTATION_FILTER_STATUS = ["open", "sent", "no_offer"] as const;

export type OpenQuotationFilterStatus = (typeof OPEN_QUOTATION_FILTER_STATUS)[number];

export interface OpenQuotationListItem {
  id: string;
  name: string;
  deadline: string;
  estimatedDeliveryTime: string;
  observation: string | null;
  status: OpenQuotationStatus;
  sentAt: string | null;
}

export interface FetchOpenQuotationsParams {
  page: number;
  totalPerPage?: number;
  sort?: OpenQuotationSortField;
  order?: SortOrder;
  status?: OpenQuotationFilterStatus;
}
