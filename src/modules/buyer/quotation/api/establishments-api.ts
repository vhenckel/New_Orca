import type { EstablishmentOption } from "@/modules/buyer/quotation/types/create-budget";
import { apiRequest } from "@/shared/api/http-client";

export async function fetchMyEstablishments(name?: string): Promise<EstablishmentOption[]> {
  const query = name?.trim() ? `?name=${encodeURIComponent(name.trim())}` : "";
  return apiRequest<EstablishmentOption[]>(`/establishments/my-establishments${query}`);
}
