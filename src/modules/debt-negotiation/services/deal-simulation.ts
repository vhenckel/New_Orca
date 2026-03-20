import { spotJson } from "@/shared/api/http-client";

const basePath = (renegotiationId: string) => `/renegotiation/${renegotiationId}/deal/simulation`;

export interface DealSimulationParams {
  entryAmount: number;
  nextDueDate: string | null;
}

export interface SimulationItem {
  installment: number;
  dueAt: string;
  amount: number;
  paidAt?: string | null;
}

export interface SimulationOption {
  quantity: number;
  amount: number;
  items: SimulationItem[];
}

export interface DealSimulationResponse {
  debtAmount: number;
  entryAmount: number;
  options: SimulationOption[];
}

export async function simulateDeal(
  renegotiationId: string,
  params: DealSimulationParams,
): Promise<DealSimulationResponse> {
  return spotJson<DealSimulationResponse>(basePath(renegotiationId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
