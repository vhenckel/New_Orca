import type { QuotationListItem, QuotationStatus } from "@/modules/quotation/types";

export const MOCK_QUOTATIONS: QuotationListItem[] = [
  {
    id: 142,
    title: "Carnes — Semana 16",
    status: "open",
    createdAt: "2026-04-09T10:00:00",
    deadlineAt: "2026-04-12T18:00:00",
    responses: "2/5",
    total: "R$ 12.450",
  },
  {
    id: 141,
    title: "Hortifruti — Semana 15",
    status: "waiting",
    createdAt: "2026-04-08T09:30:00",
    deadlineAt: "2026-04-11T12:00:00",
    responses: "3/4",
    total: "R$ 5.200",
  },
  {
    id: 140,
    title: "Bebidas — Abril",
    status: "finished",
    createdAt: "2026-04-07T14:15:00",
    deadlineAt: "2026-04-10T23:59:00",
    responses: "4/4",
    total: "R$ 8.900",
  },
  {
    id: 139,
    title: "Limpeza — Q2",
    status: "finished",
    createdAt: "2026-04-06T11:00:00",
    deadlineAt: "2026-04-09T17:00:00",
    responses: "5/5",
    total: "R$ 3.100",
  },
];

export function matchesStatus(row: QuotationListItem, filter: QuotationStatus | "all"): boolean {
  if (filter === "all") return true;
  return row.status === filter;
}
