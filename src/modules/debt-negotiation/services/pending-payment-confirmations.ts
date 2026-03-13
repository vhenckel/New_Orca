import { getDefaultCompanyId } from "@/shared/config/env";
import { spotJson } from "@/shared/api/http-client";

export interface PendingPaymentConfirmationsResponse {
  hasPending: boolean;
  count: number;
}

const PENDING_PATH = "/renegotiation/pending-payment-confirmations";

export async function fetchPendingPaymentConfirmations(
  companyId?: number
): Promise<PendingPaymentConfirmationsResponse> {
  const id = companyId ?? getDefaultCompanyId();
  return spotJson<PendingPaymentConfirmationsResponse>(`${PENDING_PATH}?companyId=${id}`);
}
