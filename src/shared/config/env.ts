/**
 * Configuração de ambiente. SaaS multi-tenant: todas as APIs devem usar companyId.
 * Hoje: companyId vem de VITE_DEFAULT_COMPANY_ID. Depois: virá do token (auth context).
 *
 * Em dev: se VITE_SPOT_API_BASE_URL for URL absoluta (http/https), usa direto; senão usa "/api" (proxy Vite) se VITE_USE_API_PROXY !== "false".
 */

const rawBaseUrl =
  import.meta.env.VITE_SPOT_API_BASE_URL ??
  "https://spot-api-management.o2obots.com";

const isAbsoluteUrl = /^https?:\/\//.test(rawBaseUrl);

export const spotApiBaseUrl =
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_API_PROXY !== "false" &&
  !isAbsoluteUrl
    ? "/api"
    : rawBaseUrl;

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

/** URLs que não usam gatekeeper (ex.: morpheus). Lista separada por vírgula. */
export function getSpotSkipGatekeeperUrls(): string[] {
  const v = import.meta.env.VITE_SPOT_SKIP_GATEKEEPER_URLS;
  if (!v || typeof v !== "string") return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** URL alternativa quando gatekeeper é morpheus e a URL está em SKIP. */
export const spotApiMorpheusUrl =
  import.meta.env.VITE_SPOT_API_MORPHEUS_URL &&
  typeof import.meta.env.VITE_SPOT_API_MORPHEUS_URL === "string"
    ? (import.meta.env.VITE_SPOT_API_MORPHEUS_URL as string)
    : null;
