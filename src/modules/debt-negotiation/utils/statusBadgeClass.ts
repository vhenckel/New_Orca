import type { TranslationKey } from "@/shared/i18n/config";

/**
 * Mapa: valor normalizado (API) → slug i18n e cor lógica.
 * Depois a cor lógica é traduzida para classes (cores do código legado).
 */
type StageColor = "green" | "red" | "blue" | "orange" | "purple" | "payment-confirm" | "prescribed" | "default";
type StageSlug =
  | "criado"
  | "cancelado"
  | "ignorado"
  | "emCobranca"
  | "emNegociacao"
  | "recuperadoParcialmente"
  | "recuperado"
  | "pagoDiretamente"
  | "pausado"
  | "pago"
  | "negociadoSemPagamento"
  | "negociado"
  | "confirmacaoPagamento"
  | "promessaPagamento"
  | "prescrita"
  | "atrasado"
  | "dividaRegistrada"
  | "outros";
type StageTranslationKey = Extract<
  TranslationKey,
  `pages.debtNegotiation.debts.status.${StageSlug}`
>;

const COLOR_CLASSES: Record<StageColor, string> = {
  green: "text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f]",
  red: "text-[#ff4d4f] bg-[#fff2f0] border border-[#ffccc7]",
  blue: "text-[#1890ff] bg-[#e6f7ff] border border-[#91d5ff]",
  orange: "text-[#fa8c16] bg-[#fff7e6] border border-[#ffd591]",
  purple: "text-[#722ed1] bg-[#f0e6ff] border border-[#d3adf7]",
  "payment-confirm": "text-[#A8071A] bg-[#FDDCDC] border border-[#F5A5A5]",
  prescribed: "text-[#9E9E9E] bg-[#9E9E9E1A] border border-[#9E9E9E]",
  default: "text-[#666666] bg-[#fafafa] border border-[#d9d9d9]",
};

const STAGE_MAP: Array<{ names: string[]; slug: StageSlug; color: StageColor }> = [
  // 1 - Criado
  { names: ["criado"], slug: "criado", color: "default" },
  // 14 - Cancelado
  { names: ["cancelado"], slug: "cancelado", color: "default" },
  // 5 - Ignorado
  { names: ["ignorado"], slug: "ignorado", color: "default" },
  // 2 - Em cobrança
  { names: ["em cobrança"], slug: "emCobranca", color: "blue" },
  // 3 - Em negociação
  { names: ["em negociação"], slug: "emNegociacao", color: "blue" },
  // 7 - Recuperado Parcialmente
  {
    names: ["recuperado parcialmente", "parcialmente recuperado"],
    slug: "recuperadoParcialmente",
    color: "green",
  },
  // 6 - Recuperado
  { names: ["recuperado"], slug: "recuperado", color: "green" },
  // 8 - Pago Direto
  {
    names: ["pago diretamente", "pago direto"],
    slug: "pagoDiretamente",
    color: "green",
  },
  // 9 - Pausado
  { names: ["pausado"], slug: "pausado", color: "green" },
  // 6 - Pago
  { names: ["pago"], slug: "pago", color: "green" },
  // 10 - Negociado sem pagamento
  { names: ["negociado sem pagamento"], slug: "negociadoSemPagamento", color: "orange" },
  // 4 - Negociado
  { names: ["negociado"], slug: "negociado", color: "orange" },
  // 11 - Confirmação de Pagamento
  {
    names: ["confirmação de pagamento", "confirmar pagamento"],
    slug: "confirmacaoPagamento",
    color: "payment-confirm",
  },
  // 12 - Promessa de Pagamento
  { names: ["promessa de pagamento"], slug: "promessaPagamento", color: "purple" },
  // 13 - Prescrita
  { names: ["prescrita"], slug: "prescrita", color: "prescribed" },
  // Atrasado / Vencido
  { names: ["atrasado", "vencido"], slug: "atrasado", color: "red" },
  // Dívida registrada (padrão)
  { names: ["dívida registrada"], slug: "dividaRegistrada", color: "default" },
];

const DEFAULT_SLUG: StageSlug = "outros";

function findStage(normalized: string): { slug: StageSlug; color: StageColor } | null {
  for (const { names, slug, color } of STAGE_MAP) {
    if (names.includes(normalized)) return { slug, color };
  }
  return null;
}

/** Retorna a classe CSS do badge para o pipelineStageName retornado pela API. */
export function statusBadgeClass(stageName: string): string {
  const n = stageName.toLowerCase().trim();
  const found = findStage(n);
  const color = found ? found.color : "default";
  return COLOR_CLASSES[color];
}

/** Retorna a chave i18n para o estágio (pages.debtNegotiation.debts.status.{slug}). */
export function getStageI18nKey(stageName: string): StageTranslationKey {
  const n = stageName.toLowerCase().trim();
  const found = findStage(n);
  const slug = found ? found.slug : DEFAULT_SLUG;
  return `pages.debtNegotiation.debts.status.${slug}` as StageTranslationKey;
}
