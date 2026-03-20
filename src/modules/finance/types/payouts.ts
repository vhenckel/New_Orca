export type PayoutStatus = "pending" | "paid" | "canceled";

export interface PayoutDayDto {
  payoutId: number;
  date: string;
  dateFormatted: string;
  status: PayoutStatus | string;
  quantity: number;
  totalAmount: number;
  totalAmountFormatted: string;
  feeAmount: number;
  feeAmountFormatted: string;
  netAmount: number;
  netAmountFormatted: string;
}

export interface ListPayoutMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListPayoutResponseDto {
  totalToTransfer: number;
  totalToTransferFormatted: string;
  pendingToTransfer: number;
  pendingToTransferFormatted: string;
  paidAmount: number;
  paidAmountFormatted: string;
  days: PayoutDayDto[];
  meta: ListPayoutMetaDto;
}

export interface ListPayoutFilters {
  statuses?: PayoutStatus[];
  orderBy?: "scheduledDate" | "createdAt" | "id";
  orderDirection?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface PayoutItemFeesDto {
  revenueShare: number;
  recoveryCost: number;
  voiceCost: number;
}

export interface PayoutItemDetailDto {
  id: number;
  contactName: string | null;
  contractId: string | null;
  cpfCnpj: string | null;
  installments: number | null;
  installment: number | null;
  paidAt: string | null;
  paidAtFormatted: string;
  totalAmount: number;
  totalAmountFormatted: string;
  feeAmount: number;
  feeAmountFormatted: string;
  netAmount: number;
  netAmountFormatted: string;
  fees?: PayoutItemFeesDto;
}

export interface GetPayoutItemsMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPayoutFilteredItemsSummaryDto {
  totalAmount: number;
  netAmount: number;
}

export interface GetPayoutResponseDto {
  id: number;
  totalAmount: number;
  netAmount: number;
  items: PayoutItemDetailDto[];
  itemsMeta: GetPayoutItemsMetaDto;
  filteredItemsSummary?: GetPayoutFilteredItemsSummaryDto;
  status?: PayoutStatus;
  scheduledDate?: string;
  paidAt?: string | null;
  notes?: { text?: string };
}

export interface GetPayoutItemsFilters {
  page?: number;
  limit?: number;
  orderBy?: "contactName" | "contractId" | "paidAt" | "totalAmount" | "netAmount" | "id";
  orderDirection?: "ASC" | "DESC";
  keyword?: string;
}

export interface PayoutInvoiceDto {
  pdfUrl?: string | null;
  xmlUrl?: string | null;
}

export interface UpdatePayoutStatusPayload {
  status?: PayoutStatus;
  notes?: { text?: string };
  scheduledDate?: string;
  paidAt?: string;
  clearInvoicePdf?: boolean;
  clearInvoiceXml?: boolean;
}
