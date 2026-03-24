import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotFetch, spotJson } from "@/shared/api/http-client";
import type {
  DebtImportFieldDefinition,
  DebtImportParseResponse,
  DebtImportValidateResponse,
  DebtImportResult,
} from "@/modules/debt-negotiation/types";

const DEBT_IMPORT_BASE_PATH = "/renegotiation/import";

function getErrorMessageFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const obj = body as Record<string, unknown>;
  const getString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

  const direct = getString(obj["message"]);
  if (direct) return direct;

  const data = obj["data"];
  if (data && typeof data === "object") {
    const dataObj = data as Record<string, unknown>;
    const nested = getString(dataObj["message"]);
    if (nested) return nested;
  }

  const err = obj["error"];
  if (err && typeof err === "object") {
    const errObj = err as Record<string, unknown>;
    const nested = getString(errObj["message"]);
    if (nested) return nested;
  }

  const errors = obj["errors"];
  if (Array.isArray(errors)) {
    const first = errors[0];
    if (first && typeof first === "object") {
      const firstObj = first as Record<string, unknown>;
      const nested = getString(firstObj["message"]);
      if (nested) return nested;
    }
  }

  return undefined;
}

async function requestJsonWith422<T>(path: string, init: RequestInit): Promise<T> {
  const res = await spotFetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (res.status === 422) {
      const message = getErrorMessageFromBody(body) ?? "Erro de validação no arquivo.";
      throw new Error(message);
    }
    throw new Error(`API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchDebtImportFields(): Promise<DebtImportFieldDefinition[]> {
  return spotJson<DebtImportFieldDefinition[]>(`${DEBT_IMPORT_BASE_PATH}/fields`);
}

export async function parseDebtImportCsv(file: File): Promise<DebtImportParseResponse> {
  const companyId = getCurrentCompanyId();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", String(companyId));
  return requestJsonWith422<DebtImportParseResponse>(`${DEBT_IMPORT_BASE_PATH}/parse`, {
    method: "POST",
    body: formData,
  });
}

export async function validateDebtImportCsv(
  file: File,
  mapping: Record<string, string | number>,
): Promise<DebtImportValidateResponse> {
  const companyId = getCurrentCompanyId();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", String(companyId));
  formData.append("mapping", JSON.stringify(mapping));
  return requestJsonWith422<DebtImportValidateResponse>(`${DEBT_IMPORT_BASE_PATH}/validate`, {
    method: "POST",
    body: formData,
  });
}

export async function revalidateDebtImportData(
  data: Array<Record<string, string>>,
): Promise<DebtImportValidateResponse> {
  const companyId = getCurrentCompanyId();
  return requestJsonWith422<DebtImportValidateResponse>(`${DEBT_IMPORT_BASE_PATH}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, data }),
  });
}

export async function importDebts(
  data: Array<Record<string, string>>,
): Promise<DebtImportResult> {
  const companyId = getCurrentCompanyId();
  return requestJsonWith422<DebtImportResult>(DEBT_IMPORT_BASE_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, data }),
  });
}

