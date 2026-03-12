/**
 * Mapa: valor normalizado (API) → slug i18n e classe do badge.
 * pipelineStageName vem da API; usamos slug para tradução e para cor.
 */
const STAGE_MAP: Array<{ names: string[]; slug: string; className: string }> = [
  { names: ["cancelado"], slug: "cancelado", className: "bg-muted text-muted-foreground" },
  { names: ["ignorado"], slug: "ignorado", className: "bg-muted text-muted-foreground" },
  { names: ["em negociação"], slug: "emNegociacao", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  { names: ["recuperado parcialmente"], slug: "recuperadoParcialmente", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  { names: ["recuperado"], slug: "recuperado", className: "bg-green-700 text-white dark:bg-green-800" },
  { names: ["pago diretamente"], slug: "pagoDiretamente", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  { names: ["confirmação de pagamento", "confirmar pagamento"], slug: "confirmacaoPagamento", className: "bg-destructive/15 text-destructive" },
  { names: ["em cobrança"], slug: "emCobranca", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  { names: ["negociado sem pagamento"], slug: "negociadoSemPagamento", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  { names: ["pago"], slug: "pago", className: "bg-green-700 text-white dark:bg-green-800" },
  { names: ["dívida registrada"], slug: "dividaRegistrada", className: "bg-muted text-muted-foreground" },
  { names: ["negociado"], slug: "negociado", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  { names: ["promessa de pagamento"], slug: "promessaPagamento", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  { names: ["atrasado"], slug: "atrasado", className: "bg-destructive/15 text-destructive" },
];

const DEFAULT_CLASS = "bg-muted text-muted-foreground";
const DEFAULT_SLUG = "outros";

function findStage(normalized: string): { slug: string; className: string } | null {
  for (const { names, slug, className } of STAGE_MAP) {
    if (names.includes(normalized)) return { slug, className };
  }
  return null;
}

/** Retorna a classe CSS do badge para o pipelineStageName retornado pela API. */
export function statusBadgeClass(stageName: string): string {
  const n = stageName.toLowerCase().trim();
  const found = findStage(n);
  return found ? found.className : DEFAULT_CLASS;
}

/** Retorna a chave i18n para o estágio (pages.debtNegotiation.debts.status.{slug}). */
export function getStageI18nKey(stageName: string): string {
  const n = stageName.toLowerCase().trim();
  const found = findStage(n);
  const slug = found ? found.slug : DEFAULT_SLUG;
  return `pages.debtNegotiation.debts.status.${slug}`;
}
