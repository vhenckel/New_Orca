/**
 * Configuração de ambiente. SaaS multi-tenant: todas as APIs devem usar companyId.
 * Hoje: companyId vem de VITE_DEFAULT_COMPANY_ID. Depois: virá do token (auth context).
 */

/** Em dev usa /api/spot (proxy do Vite) para evitar CORS. Em produção usa a URL do .env. */
export const spotApiBaseUrl = import.meta.env.DEV
  ? "/api/spot"
  : (import.meta.env.VITE_SPOT_API_BASE_URL ??
    "https://spot-api-management.o2obots.com");

/** CompanyId atual. Enquanto não houver auth, usa o valor do .env. Depois será substituído por useAuth().companyId. */
export function getDefaultCompanyId(): number {
  const id = import.meta.env.VITE_DEFAULT_COMPANY_ID;
  if (id === undefined || id === "") return 316;
  const n = Number(id);
  return Number.isNaN(n) ? 316 : n;
}

/** Token temporário para testes: colar o token do browser no .env. Depois virá do auth (login). */
const spotApiToken = import.meta.env.VITE_SPOT_API_TOKEN;

/** Headers para requisições à API Spot. Inclui Authorization se VITE_SPOT_API_TOKEN estiver definido. */
export function getSpotApiHeaders(): HeadersInit {
  if (!spotApiToken || typeof spotApiToken !== "string") return {};
  return { Authorization: `Bearer ${spotApiToken}` };
}
