import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";

const RENEGOTIATION_PATH = "/trinity/renegotiation";

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
  const url = `${spotApiBaseUrl}${RENEGOTIATION_PATH}/${renegotiationId}/deal`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "omit",
    headers: {
      ...getSpotApiHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Deal API error: ${res.status}`);
  }
  return res.json();
}
