export type AgentApplyOver = "corrected";

export interface RenegotiationConfigDto {
  agentName: string;
  companyDetails: string | null;
  lateFee: number | null;
  monthlyInterest: number | null;
  serviceFees: number | null;
  cashDiscount: number | null;
  minInstallmentValue: number | null;
  maxInstallment: number | null;

  // Campos presentes no backend (UI pode usar, mesmo que PUT não envie).
  applyOver?: AgentApplyOver | string;
  prescriptionYears?: number | null;

  // Metadata
  lastUpdate?: string | null;
}

export interface RenegotiationConfigPayload {
  agentName: string;
  companyDetails: string | null;
  lateFee: number | null;
  monthlyInterest: number | null;
  serviceFees: number | null;
  cashDiscount: number | null;
  minInstallmentValue: number | null;
  maxInstallment: number | null;
}

