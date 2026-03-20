import { spotJson } from "@/shared/api/http-client";

const RENEGOTIATION_PATH = "/renegotiation";

/** Item enviado no POST /renegotiation/:id/deal quando há quitação (alinhado ao management). */
export interface ConfirmDealItemPayload {
  installment: number;
  amount: number;
  dueAt: string;
  paidAt: string | null;
}

export interface ConfirmDealPayload {
  confirmed: boolean;
  observation: string;
  deal?: {
    items: ConfirmDealItemPayload[];
  };
}

export interface ConfirmInstallmentPaymentPayload {
  confirmed: boolean;
  observation: string;
  paidAt?: string;
  items: Array<{ id: number }>;
}

export interface ConfirmDealResult {
  success: boolean;
  message: string;
}

export async function confirmDeal(
  renegotiationId: string,
  payload: ConfirmDealPayload
): Promise<ConfirmDealResult> {
  return spotJson<ConfirmDealResult>(`${RENEGOTIATION_PATH}/${renegotiationId}/deal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function confirmInstallmentPayment(
  renegotiationId: string,
  payload: ConfirmInstallmentPaymentPayload
): Promise<ConfirmDealResult> {
  return spotJson<ConfirmDealResult>(`${RENEGOTIATION_PATH}/${renegotiationId}/deal`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
