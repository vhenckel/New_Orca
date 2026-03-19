export const LIST_ORDER_BY_MAP = {
  payoutId: "id",
  id: "id",
  scheduledDate: "scheduledDate",
  dateFormatted: "scheduledDate",
  createdAt: "createdAt",
} as const;

export const DETAILS_ORDER_BY_MAP = {
  id: "id",
  contactName: "contactName",
  contractId: "contractId",
  paidAt: "paidAt",
  paidAtFormatted: "paidAt",
  totalAmount: "totalAmount",
  totalAmountFormatted: "totalAmount",
  netAmount: "netAmount",
  netAmountFormatted: "netAmount",
} as const;
