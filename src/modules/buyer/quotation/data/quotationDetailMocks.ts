import { MOCK_QUOTATIONS } from "@/modules/buyer/quotation/data/quotationMocks";
import type { AppLocale } from "@/shared/i18n/config";
import type { QuotationDetail } from "@/modules/buyer/quotation/types";

const DETAIL_142_BASE: Omit<
  QuotationDetail,
  | "note"
  | "responsesSuppliersHint"
  | "responseProgressLabel"
  | "opportunitiesFormatted"
  | "deliveryTerms"
> = {
  id: 142,
  title: "Carnes — Semana 16",
  status: "open",
  createdAt: "2026-04-09T10:00:00",
  deadlineAt: "2026-04-12T18:00:00",
  responsesFraction: "2/5",
  itemCount: 5,
  bestTotalFormatted: "R$ 12.180,00",
  gapFormatted: "R$ 148,20",
  savingsVsHighestFormatted: "R$ 1.520,00",
  lines: [
    {
      productName: "Contrafilé",
      brandsLabel: "Friboi, Minerva",
      quantityLabel: "18 kg",
      chosenSupplier: "Distribuidora Sul",
      bestSupplierName: "Atacado Central",
      totalFormatted: "R$ 2.890,00",
      bestTotalFormatted: "R$ 2.804,20",
      diff: { savingsFormatted: "R$ 85,80" },
      deliveryLabel: "24h",
      lineStatus: "savings",
    },
    {
      productName: "Picanha",
      brandsLabel: "Aurora",
      quantityLabel: "12 kg",
      chosenSupplier: "Atacado Central",
      totalFormatted: "R$ 4.120,00",
      bestTotalFormatted: "R$ 4.120,00",
      diff: "best",
      deliveryLabel: "48h",
      lineStatus: "best",
    },
    {
      productName: "Alcatra",
      brandsLabel: "Frimesa, JBS",
      quantityLabel: "20 kg",
      chosenSupplier: "Atacado Central",
      totalFormatted: "R$ 3.200,00",
      bestTotalFormatted: "R$ 3.200,00",
      diff: "best",
      deliveryLabel: "24h",
      lineStatus: "best",
    },
    {
      productName: "Costela",
      brandsLabel: "Swift",
      quantityLabel: "25 kg",
      chosenSupplier: "Distribuidora Sul",
      bestSupplierName: "Frigorífico Norte",
      totalFormatted: "R$ 1.980,00",
      bestTotalFormatted: "R$ 1.917,60",
      diff: { savingsFormatted: "R$ 62,40" },
      deliveryLabel: "48h",
      lineStatus: "savings",
    },
    {
      productName: "Maminha",
      brandsLabel: "Marfrig",
      quantityLabel: "10 kg",
      chosenSupplier: "Frigorífico Norte",
      totalFormatted: "R$ 1.260,00",
      bestTotalFormatted: "R$ 1.258,20",
      diff: { savingsFormatted: "R$ 1,80" },
      deliveryLabel: "24h",
      lineStatus: "savings",
    },
  ],
  suppliers: [
    {
      name: "Atacado Central",
      response: "answered",
      responseTimeLabel: "2h 15min",
      totalFormatted: "R$ 12.180,00",
      competitivenessLabel: "98%",
    },
    {
      name: "Distribuidora Sul",
      response: "partial",
      responseTimeLabel: "5h 40min",
      totalFormatted: "R$ 12.450,00",
      competitivenessLabel: "92%",
    },
    {
      name: "Frigorífico Norte",
      response: "answered",
      responseTimeLabel: "3h 05min",
      totalFormatted: "R$ 12.310,00",
      competitivenessLabel: "95%",
    },
    {
      name: "Atacado Leste",
      response: "pending",
      responseTimeLabel: "—",
      totalFormatted: "—",
      competitivenessLabel: "—",
    },
    {
      name: "Carnes Premium",
      response: "pending",
      responseTimeLabel: "—",
      totalFormatted: "—",
      competitivenessLabel: "—",
    },
  ],
  financeChosenFormatted: "R$ 12.450,00",
  financeBestFormatted: "R$ 12.180,00",
  financeWorstFormatted: "R$ 13.970,00",
};

const DETAIL_142_I18N: Record<
  AppLocale,
  Pick<
    QuotationDetail,
    | "note"
    | "responsesSuppliersHint"
    | "responseProgressLabel"
    | "opportunitiesFormatted"
    | "deliveryTerms"
  >
> = {
  "pt-BR": {
    note: "Priorizar fornecedores com histórico de entrega pontual.",
    responsesSuppliersHint: "40% dos fornecedores",
    responseProgressLabel: "2 de 5 fornecedores",
    opportunitiesFormatted: "R$ 148,20 em oportunidades",
    deliveryTerms: "Entrega em até 24h após aprovação",
  },
  "en-US": {
    note: "Prioritize suppliers with a track record of on-time delivery.",
    responsesSuppliersHint: "40% of suppliers",
    responseProgressLabel: "2 of 5 suppliers",
    opportunitiesFormatted: "R$ 148.20 in opportunities",
    deliveryTerms: "Delivery within 24h after approval",
  },
};

function buildDetail142(locale: AppLocale): QuotationDetail {
  return {
    ...DETAIL_142_BASE,
    ...DETAIL_142_I18N[locale],
  };
}

export function getQuotationDetail(
  id: string | undefined,
  locale: AppLocale,
): QuotationDetail | null {
  if (id == null || id === "") return null;
  const n = Number(id);
  if (Number.isNaN(n)) return null;
  const listRow = MOCK_QUOTATIONS.find((row) => row.id === n);
  if (!listRow) return null;
  const base = buildDetail142(locale);
  return {
    ...base,
    id: listRow.id,
    title: listRow.title,
    status: listRow.status,
    createdAt: listRow.createdAt,
    deadlineAt: listRow.deadlineAt,
    responsesFraction: listRow.responses,
  };
}
