export type SupplierQuotationStatus = "pending" | "in_progress" | "responded" | "attention";

export type SupplierQuotationPriority = "high" | "medium" | "low";

export interface SupplierQuotationListItem {
  id: number;
  title: string;
  restaurantName: string;
  contactEmail: string;
  city: string;
  categories: string[];
  deadlineAt: string;
  deliveryLabel: string;
  progress: number;
  status: SupplierQuotationStatus;
  priority: SupplierQuotationPriority;
  requestedItems: number;
  estimatedTotal: string;
  action: "quote" | "view";
}

export interface SupplierQuotationDetailItem {
  id: string;
  productName: string;
  /** Embalagem solicitada pelo comprador (ex.: 1kg, 750ml). */
  requestedPackaging: string;
  segments: string[];
  quantity: number;
  unitLabel: string;
  /** Uma única marca quando a API envia `requestedBrand` (sem `requestedBrands`). */
  requestedBrand?: string;
  /** Várias marcas pré-selecionadas: o fornecedor informa o preço em uma linha por marca. */
  requestedBrands?: string[];
  fallbackHint?: string;
  selectedBrand?: string;
  unitPrice?: number;
}

export interface SupplierQuotationDetail {
  id: number;
  title: string;
  status: SupplierQuotationStatus;
  buyerName: string;
  buyerRepresentativeName: string;
  buyerContactEmail: string;
  buyerTaxId: string;
  buyerPhone: string;
  buyerAddressLine: string;
  buyerCity: string;
  createdAt: string;
  deadlineAt: string;
  deliveryWindowLabel: string;
  paymentMethodLabel: string;
  paymentDeadlineLabel: string;
  /** Data até a qual a proposta do fornecedor permanece válida (ISO 8601). */
  quotationValidUntilAt: string;
  generalNotes: string;
  items: SupplierQuotationDetailItem[];
}

export const SUPPLIER_QUOTATION_LIST_MOCKS: SupplierQuotationListItem[] = [
  {
    id: 142,
    title: "Reposição de alimentos — Semana 16",
    restaurantName: "Thiagohff Restaurante",
    contactEmail: "thiagohoff+r1@gmail.com",
    city: "Joinville, SC",
    categories: ["Acucares", "Bebidas", "Secos", "Laticinios"],
    deadlineAt: "2026-04-18T14:22:00-03:00",
    deliveryLabel: "Entrega em ate 1 dia",
    progress: 0,
    status: "pending",
    priority: "high",
    requestedItems: 4,
    estimatedTotal: "R$ 3.800",
    action: "quote",
  },
  {
    id: 141,
    title: "Hortifruti e mercearia",
    restaurantName: "Bistro Mercado Norte",
    contactEmail: "compras@mercadonorte.com",
    city: "Curitiba, PR",
    categories: ["Hortifruti", "Mercearia", "Temperos"],
    deadlineAt: "2026-04-19T10:00:00-03:00",
    deliveryLabel: "Janeiro 07h31",
    progress: 62,
    status: "in_progress",
    priority: "medium",
    requestedItems: 18,
    estimatedTotal: "R$ 8.450",
    action: "quote",
  },
  {
    id: 140,
    title: "Bebidas - Abril",
    restaurantName: "Bar Avenida",
    contactEmail: "financeiro@baravenida.com",
    city: "Florianopolis, SC",
    categories: ["Bebidas", "Descartaveis"],
    deadlineAt: "2026-04-20T16:30:00-03:00",
    deliveryLabel: "Entrega combinada",
    progress: 100,
    status: "responded",
    priority: "low",
    requestedItems: 12,
    estimatedTotal: "R$ 6.200",
    action: "view",
  },
  {
    id: 139,
    title: "Carnes nobres e secos",
    restaurantName: "Casa do Chef",
    contactEmail: "compras@casadochef.com",
    city: "Blumenau, SC",
    categories: ["Carnes", "Secos"],
    deadlineAt: "2026-04-18T18:00:00-03:00",
    deliveryLabel: "Recebimento ate 12h",
    progress: 35,
    status: "attention",
    priority: "high",
    requestedItems: 9,
    estimatedTotal: "R$ 12.900",
    action: "quote",
  },
];

export const SUPPLIER_QUOTATION_DETAIL_MOCKS: Record<number, SupplierQuotationDetail> = {
  142: {
    id: 142,
    title: "Reposição de alimentos — Semana 16",
    status: "pending",
    buyerName: "Thiagohff Restaurante",
    buyerRepresentativeName: "thiagohoff+r1@gmail.com",
    buyerContactEmail: "thiagohoff+r1@gmail.com",
    buyerTaxId: "31.312.311/0001-10",
    buyerPhone: "(47) 99914-9820",
    buyerAddressLine: "Rua Lages, 10, América, Joinville, Santa Catarina, 89204-010",
    buyerCity: "Joinville, SC",
    createdAt: "2026-04-18T14:22:00-03:00",
    deadlineAt: "2026-04-18T14:22:00-03:00",
    deliveryWindowLabel: "Entrega em até 1 dia solicitada",
    paymentMethodLabel: "Boleto",
    paymentDeadlineLabel: "14 dias",
    quotationValidUntilAt: "2026-04-25T23:59:59-03:00",
    generalNotes: "",
    items: [
      {
        id: "acucar-refinado",
        productName: "AÇÚCAR REFINADO",
        requestedPackaging: "1kg",
        segments: ["Açúcares", "Granel"],
        quantity: 10,
        unitLabel: "un",
        fallbackHint: "Produto sem marca definida",
      },
      {
        id: "aperitivo-aperol",
        productName: "Aperitivo Aperol",
        requestedPackaging: "750ml",
        segments: ["Bebidas", "Secos"],
        quantity: 10,
        unitLabel: "un",
        requestedBrand: "Aperol",
      },
      {
        id: "amido-milho",
        productName: "Amido de milho",
        requestedPackaging: "1kg",
        segments: ["Confeitaria/panificação", "Secos"],
        quantity: 10,
        unitLabel: "un",
        requestedBrands: ["Fritz e Frida", "União"],
      },
      {
        id: "creme-leite",
        productName: "Creme de leite",
        requestedPackaging: "200g",
        segments: ["Confeitaria/panificação", "Laticínios", "Secos", "Mercearia"],
        quantity: 10,
        unitLabel: "un",
        requestedBrand: "Piracanjuba",
      },
    ],
  },
};

export function getSupplierQuotationDetail(id: string | undefined) {
  if (!id) return null;
  const quotationId = Number(id);
  if (Number.isNaN(quotationId)) return null;
  return SUPPLIER_QUOTATION_DETAIL_MOCKS[quotationId] ?? null;
}
