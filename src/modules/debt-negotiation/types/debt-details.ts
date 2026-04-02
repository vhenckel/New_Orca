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
  /** Valor original (contrato) na listagem view/debt-details. */
  debtAmount: string;
  /**
   * Valor atualizado (juros/multa etc.) na mesma API.
   * No detalhe GET /renegotiation/:id/details o campo equivalente é `debtAmount`; aqui o nome diverge.
   */
  debtValue?: string | number | null;
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
  /** Ausentes = API sem restrição de período (comportamento legado “todo o período”). */
  startDate?: string;
  endDate?: string;
  companyId: number;
  orderBy?: string;
  orderByDirection?: "ASC" | "DESC";
  /** Filtro por estágios (ex.: 11 = Confirmação de pagamento). */
  statuses?: number[];
  /** Filtro por nome do contato (campo `name` da API). */
  name?: string;
  /** Filtro por documento (campo `document` da API). */
  document?: string;
}
