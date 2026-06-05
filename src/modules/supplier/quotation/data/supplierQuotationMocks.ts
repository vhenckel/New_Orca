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

