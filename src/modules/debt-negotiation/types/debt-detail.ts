/** Item do deal (parcela) retornado quando a dívida tem acordo com parcelas. */
export interface DealItem {
  id: string;
  installment: number;
  amount: number;
  dueAt: string;
  paidAt: string | null;
  paidVia: string | null;
}

/** Deal opcional: presente quando há parcelas (ex.: Recuperado Parcialmente). */
export interface DebtDetailDeal {
  id: string;
  items: DealItem[];
}

/** Resposta da API GET /trinity/renegotiation/:id/details (detalhe de uma dívida). */
export interface DebtDetailResponse {
  renegotiationId: string;
  contactId: string;
  contactName: string;
  contactCpf: string;
  contactCnpj: string;
  pipelineStageId: number;
  pipelineStageName: string;
  debtAge: number;
  debtAmount: number;
  debtRegistrationDate: string;
  platformRegistrationDate: string;
  originalDebtAmount: number;
  negotiatedValue: number | null;
  recoveredValue: number | null;
  contractId: string;
  reminderAt: string | null;
  /** Presente quando a dívida tem acordo com parcelas (ex.: Recuperado Parcialmente). */
  deal?: DebtDetailDeal;
}
