import { spotJson } from "@/shared/api/http-client";

const RENEGOTIATION_PATH = "/renegotiation";

export interface ConfirmDealPayload {
  confirmed: boolean;
  observation: string;
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
