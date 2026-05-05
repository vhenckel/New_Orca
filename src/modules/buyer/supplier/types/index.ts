export type SupplierRegionId = "grande-sp" | "interior-sp";

export type SupplierBranchId = "matriz" | "norte" | "litoral";

export type SupplierListItem = {
  id: string;
  name: string;
  /** Valor em reais (ex.: 500 → R$ 500). */
  minOrderBrl: number;
  region: SupplierRegionId;
  rating: number;
  responseTimeMinutes: number;
  orders: number;
  /** Lista em cards (mock; API depois). */
  contactName: string;
  phone: string;
  deliveryLabel: string;
  paymentTermLabel: string;
  isActive: boolean;
  isNew?: boolean;
  branch: SupplierBranchId;
};

export type SupplierServiceLocation = {
  name: string;
  cityState: string;
};

export type SupplierRecentQuotationStatus = "expired" | "answered";

export type SupplierRecentQuotation = {
  code: string;
  /** Data já formatada para exibição (mock). */
  dateLabel: string;
  itemsCount: number;
  /** Total já formatado (mock). */
  totalLabel: string;
  status: SupplierRecentQuotationStatus;
};

/** Indicadores da aba Desempenho (percentuais 0–100). */
export type SupplierPerformanceIndicators = {
  responseRatePercent: number;
  expiredQuotationsPercent: number;
  deliveryPunctualityPercent: number;
};

/** Dados extras da tela de detalhe (mock; depois virá da API). */
export type SupplierDetailData = {
  list: SupplierListItem;
  isActive: boolean;
  /** Texto da linha “última cotação há …”. */
  lastQuoteDaysAgo: number;
  contact: {
    representative: string;
    phone: string;
    email: string;
  };
  locations: SupplierServiceLocation[];
  /** Total exibido no KPI “Orçamentos”. */
  quotationsCount: number;
  winRatePercent: number;
  segments: string[];
  recentQuotations: SupplierRecentQuotation[];
  performance: SupplierPerformanceIndicators;
};
