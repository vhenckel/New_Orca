import { getSpotApiHeaders, spotApiBaseUrl, getDefaultCompanyId } from "@/shared/config/env";

export interface PendingPaymentConfirmationsResponse {
  hasPending: boolean;
  count: number;
}

const PENDING_PATH = "/trinity/renegotiation/pending-payment-confirmations";

export async function fetchPendingPaymentConfirmations(
  companyId?: number
): Promise<PendingPaymentConfirmationsResponse> {
  const id = companyId ?? getDefaultCompanyId();
  const url = `${spotApiBaseUrl}${PENDING_PATH}?companyId=${id}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Pending payment confirmations API error: ${res.status}`);
  }
  return res.json();
}
