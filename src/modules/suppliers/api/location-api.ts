import { apiRequest } from "@/shared/api/http-client";

export interface LocationState {
  name: string;
  uf: string;
}

export interface LocationCity {
  id: number;
  name: string;
}

export async function fetchLocationStates(): Promise<LocationState[]> {
  return apiRequest<LocationState[]>("/location/state");
}

export async function fetchLocationCities(uf: string): Promise<LocationCity[]> {
  return apiRequest<LocationCity[]>(`/location/state/${encodeURIComponent(uf)}/cities`);
}
