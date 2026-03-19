import type {
  GetPayoutItemsFilters,
  GetPayoutResponseDto,
  ListPayoutFilters,
  ListPayoutResponseDto,
  PayoutInvoiceDto,
  UpdatePayoutStatusPayload,
} from "@/modules/finance/types/payouts";
import { spotFetch, spotJson } from "@/shared/api/http-client";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

function withCompanyId(
  path: string,
  params: Record<string, string | number | Array<string | number> | undefined>,
) {
  const search = new URLSearchParams();
  const companyId = getCurrentCompanyId();
  search.set("companyId", String(companyId));
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
      return;
    }
    search.set(key, String(value));
  });
  return `${path}?${search.toString()}`;
}

export function fetchPayoutList(month: number, year: number, filters: ListPayoutFilters) {
  return spotJson<ListPayoutResponseDto>(
    withCompanyId("/payout", {
      month,
      year,
      status: filters.statuses,
      orderBy: filters.orderBy,
      orderDirection: filters.orderDirection,
      page: filters.page,
      limit: filters.limit,
    }),
  );
}

export function fetchPayoutDetails(payoutId: number, filters: GetPayoutItemsFilters) {
  return spotJson<GetPayoutResponseDto>(
    withCompanyId(`/payout/${payoutId}`, {
      page: filters.page,
      limit: filters.limit,
      orderBy: filters.orderBy,
      orderDirection: filters.orderDirection,
      keyword: filters.keyword,
    }),
  );
}

export function fetchPayoutInvoice(payoutId: number) {
  return spotJson<PayoutInvoiceDto>(withCompanyId(`/payout/${payoutId}/invoice`, {}));
}

export async function updatePayoutStatus(payoutId: number, payload: UpdatePayoutStatusPayload) {
  await spotFetch(withCompanyId(`/payout/${payoutId}/status`, {}), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function uploadPayoutInvoice(payoutId: number, file: File, kind: "pdf" | "xml") {
  const formData = new FormData();
  formData.append("file", file);
  const res = await spotFetch(withCompanyId(`/payout/${payoutId}/invoice/${kind}`, {}), {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error(`Falha ao enviar arquivo ${kind.toUpperCase()}.`);
}

export function uploadPayoutInvoicePdf(payoutId: number, file: File) {
  return uploadPayoutInvoice(payoutId, file, "pdf");
}

export function uploadPayoutInvoiceXml(payoutId: number, file: File) {
  return uploadPayoutInvoice(payoutId, file, "xml");
}

export async function exportPayoutCsv(payoutId: number): Promise<Blob> {
  const res = await spotFetch(withCompanyId(`/payout/${payoutId}/export`, {}), {
    method: "GET",
  });
  if (!res.ok) throw new Error("Falha ao exportar CSV.");
  return res.blob();
}
