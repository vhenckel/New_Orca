/**
 * Gatekeeper: resolve base URL por companyId (partition).
 * Alinhado ao management: GET /admin/partition, find by companyId, rewrite baseUrl -> baseUrl/gatekeeperName.
 * Sem BFF/Redis: cache em memória com TTL.
 */

import { spotApiBaseUrl } from "@/shared/config/env";

export type Gatekeeper = {
  channelId: number;
  companyId: string;
  key: string;
  appkey: string;
  externalId: string;
  name: string;
};

const PARTITION_PATH = "/admin/partition";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

let cachedPartition: Gatekeeper[] | null = null;
let cacheExpiresAt = 0;
let loadPromise: Promise<Gatekeeper[]> | null = null;

function isCacheValid(): boolean {
  return cachedPartition != null && Date.now() < cacheExpiresAt;
}

/** Carrega lista de partições (gatekeepers) da API. Usa cache com TTL. headers = getSpotAuthHeaders() do caller. */
export async function loadPartition(headers: HeadersInit): Promise<Gatekeeper[]> {
  if (isCacheValid() && cachedPartition) return cachedPartition;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const url = `${spotApiBaseUrl}${PARTITION_PATH}`.replace(/([^:]\/)\/+/g, "$1");
      const res = await fetch(url, {
        credentials: "omit",
        headers,
      });
      if (!res.ok) throw new Error(`Partition error: ${res.status}`);
      const data = (await res.json()) as Gatekeeper[];
      cachedPartition = Array.isArray(data) ? data : [];
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return cachedPartition;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/** Encontra gatekeeper por companyId (string ou number). */
export function findGatekeeperByCompanyId(
  partition: Gatekeeper[],
  companyId: string | number
): Gatekeeper | undefined {
  const id = String(companyId);
  return partition.find((g) => String(g.companyId) === id);
}

/**
 * Retorna a base URL efetiva para o companyId: baseUrl ou baseUrl/gatekeeperName.
 * getHeaders: ex. getSpotAuthHeaders (passado pelo http-client para evitar ciclo).
 */
export async function resolveSpotBaseUrl(
  baseUrl: string,
  companyId: number | string | null | undefined,
  getHeaders: () => HeadersInit
): Promise<string> {
  if (companyId == null || companyId === "") return baseUrl;

  try {
    const partition = await loadPartition(getHeaders());
    const gate = findGatekeeperByCompanyId(partition, companyId);
    if (!gate?.name) return baseUrl;
    const base = baseUrl.replace(/\/$/, "");
    return `${base}/${gate.name}`;
  } catch {
    return baseUrl;
  }
}

/** Invalida cache (útil após logout ou troca de empresa). */
export function clearPartitionCache(): void {
  cachedPartition = null;
  cacheExpiresAt = 0;
  loadPromise = null;
}
