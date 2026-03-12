/** Uma dívida na listagem retornada pela API debt-details. */
export interface DebtDetailsItem {
  renegotiationId: string;
  contactId: number;
  contactName: string;
  contactCpf: string;
  contactCnpj: string;
  pipelineStageId: number;
  pipelineStageName: string;
  debtAge: string;
  debtAmount: string;
  negotiatedValue: string | null;
  recoveredValue: string | null;
  contractId: string;
  debtRegistrationDate: string;
  nextDueAt: string | null;
  isOverdue: boolean;
}

export interface DebtDetailsResponse {
  totalDebt: { currentValue: number; previousValue: number };
  totalDebtCount: { currentValue: number; previousValue: number };
  filteredRenegotiationIds: string[];
  data: DebtDetailsItem[];
  count: number;
  total: number;
  availableFilters?: Array<{
    id: string;
    type: string;
    label: string;
    count: number;
    options: Array<{ value: number; label: string }>;
  }>;
}

export interface DebtDetailsParams {
  take: number;
  skip: number;
  startDate: string;
  endDate: string;
  companyId: number;
  orderBy?: string;
  orderByDirection?: "ASC" | "DESC";
  /** Filtro por estágios (ex.: 11 = Confirmação de pagamento). */
  statuses?: number[];
}
