import { spotJson } from "@/shared/api/http-client";

const RENEGOTIATION_MANAGE_STATUS_PATH = "/renegotiation/manage-status";

export type ManageDebtStatusNewStatus = "CANCELED" | "PAYMENT_CONFIRM";

export interface ManageDebtStatusPayload {
  renegotiationIds: number[];
  newStatus: ManageDebtStatusNewStatus;
  reason?: string;
}

export interface ManageDebtStatusResult {
  results: { renegotiationId: number; changed: boolean }[];
}

export async function manageDebtStatus(
  payload: ManageDebtStatusPayload,
): Promise<ManageDebtStatusResult> {
  return spotJson<ManageDebtStatusResult>(RENEGOTIATION_MANAGE_STATUS_PATH, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

