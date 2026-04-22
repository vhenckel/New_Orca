/**
 * Configuração de ambiente do Orca.
 * companyId default vem do .env e depois é sobrescrito pelo token da sessão.
 *
 * Usa apenas variáveis `VITE_ORCA_*`.
 */

const rawBaseUrl =
  import.meta.env.VITE_ORCA_API_BASE_URL ??
  "https://api.orca.app";

const isAbsoluteUrl = /^https?:\/\//.test(rawBaseUrl);

export const apiBaseUrl =
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

/** Token opcional de fallback em dev quando não houver sessão autenticada. */
const apiToken =
  import.meta.env.VITE_ORCA_API_TOKEN;

/** Headers base para API. Inclui Authorization se token de fallback estiver definido. */
export function getApiHeaders(): HeadersInit {
  if (!apiToken || typeof apiToken !== "string") return {};
  return { Authorization: `Bearer ${apiToken}` };
}

/** Paths que não devem passar por resolução de gatekeeper. Lista separada por vírgula. */
export function getSkipGatekeeperPaths(): string[] {
  const v =
    import.meta.env.VITE_ORCA_SKIP_GATEKEEPER_PATHS;
  if (!v || typeof v !== "string") return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** URL alternativa para bypass de gatekeeper em paths de skip. */
export const apiBypassBaseUrl =
  import.meta.env.VITE_ORCA_API_BYPASS_BASE_URL &&
  typeof import.meta.env.VITE_ORCA_API_BYPASS_BASE_URL === "string"
    ? (import.meta.env.VITE_ORCA_API_BYPASS_BASE_URL as string)
    : null;
