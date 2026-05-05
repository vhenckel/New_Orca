import type {
  SupplierDetailData,
  SupplierListItem,
  SupplierPerformanceIndicators,
  SupplierRecentQuotation,
} from "@/modules/buyer/supplier/types";

/** Dados de demonstração — cards da lista + detalhe. */
export const MOCK_SUPPLIERS: SupplierListItem[] = [
  {
    id: "cromus",
    name: "Cromus",
    minOrderBrl: 1000,
    region: "grande-sp",
    rating: 4.7,
    responseTimeMinutes: 120,
    orders: 45,
    contactName: "Romulo Dia Amaral",
    phone: "(27) 9 9989-9989",
    deliveryLabel: "1 dia",
    paymentTermLabel: "10 dias",
    isActive: true,
    isNew: true,
    branch: "matriz",
  },
  {
    id: "canudo-cia",
    name: "Canudo e Cia",
    minOrderBrl: 1500,
    region: "interior-sp",
    rating: 4.5,
    responseTimeMinutes: 180,
    orders: 32,
    contactName: "Juliana Mota",
    phone: "(11) 9 8877-6655",
    deliveryLabel: "2 dias",
    paymentTermLabel: "15 dias",
    isActive: true,
    isNew: true,
    branch: "norte",
  },
  {
    id: "brisa-gourmet",
    name: "Brisa Gourmet",
    minOrderBrl: 800,
    region: "grande-sp",
    rating: 4.9,
    responseTimeMinutes: 90,
    orders: 61,
    contactName: "Paulo Henrique",
    phone: "(21) 9 7766-5544",
    deliveryLabel: "1 dia",
    paymentTermLabel: "7 dias",
    isActive: true,
    branch: "litoral",
  },
  {
    id: "cantina-sabor",
    name: "Cantina do Sabor",
    minOrderBrl: 1200,
    region: "interior-sp",
    rating: 4.4,
    responseTimeMinutes: 200,
    orders: 24,
    contactName: "Fernanda Costa",
    phone: "(47) 9 3344-2211",
    deliveryLabel: "3 dias",
    paymentTermLabel: "20 dias",
    isActive: true,
    branch: "matriz",
  },
  {
    id: "distribuidora-central",
    name: "Distribuidora Central",
    minOrderBrl: 500,
    region: "grande-sp",
    rating: 4.8,
    responseTimeMinutes: 120,
    orders: 118,
    contactName: "Marcos Andrade",
    phone: "+55 (47) 99914-9820",
    deliveryLabel: "2 dias",
    paymentTermLabel: "10 dias",
    isActive: true,
    branch: "norte",
  },
  {
    id: "alimentos-premium",
    name: "Alimentos Premium",
    minOrderBrl: 800,
    region: "interior-sp",
    rating: 4.5,
    responseTimeMinutes: 180,
    orders: 32,
    contactName: "Renata Silva",
    phone: "(19) 9 4455-3322",
    deliveryLabel: "4 dias",
    paymentTermLabel: "12 dias",
    isActive: true,
    branch: "litoral",
  },
  {
    id: "hortifruti-express",
    name: "Hortifruti Express",
    minOrderBrl: 150,
    region: "grande-sp",
    rating: 4.9,
    responseTimeMinutes: 90,
    orders: 28,
    contactName: "Carlos Mendes",
    phone: "(11) 9 1122-3344",
    deliveryLabel: "1 dia",
    paymentTermLabel: "5 dias",
    isActive: true,
    isNew: true,
    branch: "matriz",
  },
  {
    id: "bebidas-cia",
    name: "Bebidas & Cia",
    minOrderBrl: 600,
    region: "interior-sp",
    rating: 4.3,
    responseTimeMinutes: 240,
    orders: 19,
    contactName: "Luís Ferreira",
    phone: "(15) 9 9988-7766",
    deliveryLabel: "3 dias",
    paymentTermLabel: "14 dias",
    isActive: false,
    branch: "norte",
  },
  {
    id: "frigorifico-abc",
    name: "Frigorífico ABC",
    minOrderBrl: 400,
    region: "grande-sp",
    rating: 4.7,
    responseTimeMinutes: 30,
    orders: 52,
    contactName: "Ana Beatriz Lima",
    phone: "(13) 9 6655-4433",
    deliveryLabel: "1 dia",
    paymentTermLabel: "8 dias",
    isActive: true,
    branch: "litoral",
  },
];

const byId = new Map(MOCK_SUPPLIERS.map((s) => [s.id, s]));

export function getSupplierById(id: string | undefined): SupplierListItem | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

const DISTRIBUIDORA_SEGMENTS: string[] = [
  "Bebidas",
  "Grãos e Massas",
  "Refrigerantes",
  "Laticínios",
  "Carnes",
  "Alimentos",
  "Açúcares",
  "Grãos",
  "Óleos",
  "Congelados",
  "Frios",
  "Embalagem",
  "Hortifruti",
  "Limpeza",
  "Mercearia",
  "Condimentos",
  "Snacks",
  "Água e Gelo",
  "Chás e Cafés",
  "Doces",
  "Panificação",
  "Conservas",
  "Temperos",
  "Orgânicos",
  "Descartáveis",
  "Utensílios",
  "Sobremesas",
  "Moluscos e Peixes",
  "Frutas",
];

const FALLBACK_SEGMENTS = [
  "Bebidas",
  "Laticínios",
  "Hortifruti",
  "Limpeza",
  "Congelados",
  "Grãos",
  "Óleos",
  "Embalagem",
  "Carnes",
  "Mercearia",
];

function hashSeed(id: string): number {
  return id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function defaultRecentQuotations(seed: number): SupplierRecentQuotation[] {
  const base = 2380 + (seed % 35);
  return [
    {
      code: `ORC-${base + 21}`,
      dateLabel: "18/04/2026",
      itemsCount: 12,
      totalLabel: "R$ 4.250,00",
      status: "expired",
    },
    {
      code: `ORC-${base + 8}`,
      dateLabel: "15/04/2026",
      itemsCount: 8,
      totalLabel: "R$ 2.100,00",
      status: "answered",
    },
    {
      code: `ORC-${base - 5}`,
      dateLabel: "10/04/2026",
      itemsCount: 15,
      totalLabel: "R$ 5.420,00",
      status: "answered",
    },
    {
      code: `ORC-${base - 18}`,
      dateLabel: "02/04/2026",
      itemsCount: 4,
      totalLabel: "R$ 890,00",
      status: "expired",
    },
  ];
}

function defaultPerformance(seed: number): SupplierPerformanceIndicators {
  return {
    responseRatePercent: 72 + (seed % 22),
    expiredQuotationsPercent: 48 + (seed % 20),
    deliveryPunctualityPercent: 74 + (seed % 20),
  };
}

function defaultDetailFromList(list: SupplierListItem): SupplierDetailData {
  const seed = hashSeed(list.id);
  const locCount = 2 + (seed % 3);
  const locations: SupplierDetailData["locations"] = Array.from({ length: locCount }, (_, i) => ({
    name: i === 0 ? "Matriz" : `Unidade ${i + 1}`,
    cityState: list.region === "grande-sp" ? "São Paulo · SP" : "Campinas · SP",
  }));

  return {
    list,
    isActive: list.isActive,
    lastQuoteDaysAgo: 3 + (seed % 14),
    contact: {
      representative: list.contactName,
      phone: list.phone,
      email: `contato@${list.id.replace(/[^a-z0-9-]/g, "")}.com.br`,
    },
    locations,
    quotationsCount: Math.max(8, Math.min(list.orders, 120)),
    winRatePercent: 35 + (seed % 45),
    segments: FALLBACK_SEGMENTS.slice(0, 6 + (seed % 5)),
    recentQuotations: defaultRecentQuotations(seed),
    performance: defaultPerformance(seed),
  };
}

const DETAIL_OVERRIDES: Record<string, Partial<Omit<SupplierDetailData, "list">>> = {
  "distribuidora-central": {
    isActive: true,
    lastQuoteDaysAgo: 2,
    contact: {
      representative: "Marcos Andrade",
      phone: "+55 (47) 99914-9820",
      email: "comercial@distcentral.com.br",
    },
    locations: [
      { name: "Todos", cityState: "Joinville · Santa Catarina" },
      { name: "Bom Retiro", cityState: "Joinville · Santa Catarina" },
      { name: "Anita Garibaldi", cityState: "Joinville · Santa Catarina" },
      { name: "América", cityState: "Joinville · Santa Catarina" },
    ],
    quotationsCount: 45,
    winRatePercent: 62,
    segments: DISTRIBUIDORA_SEGMENTS,
    recentQuotations: [
      {
        code: "ORC-2451",
        dateLabel: "18/04/2026",
        itemsCount: 12,
        totalLabel: "R$ 4.250,00",
        status: "expired",
      },
      {
        code: "ORC-2438",
        dateLabel: "15/04/2026",
        itemsCount: 8,
        totalLabel: "R$ 2.100,00",
        status: "answered",
      },
      {
        code: "ORC-2422",
        dateLabel: "10/04/2026",
        itemsCount: 15,
        totalLabel: "R$ 5.420,00",
        status: "answered",
      },
      {
        code: "ORC-2410",
        dateLabel: "02/04/2026",
        itemsCount: 4,
        totalLabel: "R$ 890,00",
        status: "expired",
      },
    ],
    performance: {
      responseRatePercent: 92,
      expiredQuotationsPercent: 62,
      deliveryPunctualityPercent: 88,
    },
  },
};

export function getSupplierDetail(id: string | undefined): SupplierDetailData | undefined {
  const list = getSupplierById(id);
  if (!list) return undefined;
  const defaults = defaultDetailFromList(list);
  const extra = DETAIL_OVERRIDES[list.id];
  if (!extra) return defaults;
  return {
    ...defaults,
    ...extra,
    contact: extra.contact ?? defaults.contact,
    locations: extra.locations ?? defaults.locations,
    segments: extra.segments ?? defaults.segments,
    recentQuotations: extra.recentQuotations ?? defaults.recentQuotations,
    performance: extra.performance ?? defaults.performance,
    list,
  };
}
