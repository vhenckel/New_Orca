import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotJson } from "@/shared/api/http-client";
import type {
  DebtImportFieldDefinition,
  DebtImportParseResponse,
  DebtImportValidateResponse,
  DebtImportResult,
} from "@/modules/debt-negotiation/types";

const DEBT_IMPORT_BASE_PATH = "/renegotiation/import";

export async function fetchDebtImportFields(): Promise<DebtImportFieldDefinition[]> {
  return spotJson<DebtImportFieldDefinition[]>(`${DEBT_IMPORT_BASE_PATH}/fields`);
}

export async function parseDebtImportCsv(file: File): Promise<DebtImportParseResponse> {
  const companyId = getCurrentCompanyId();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", String(companyId));
  return spotJson<DebtImportParseResponse>(`${DEBT_IMPORT_BASE_PATH}/parse`, {
    method: "POST",
    body: formData,
  });
}

export async function validateDebtImportCsv(
  file: File,
  mapping: Record<string, string>,
): Promise<DebtImportValidateResponse> {
  const companyId = getCurrentCompanyId();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", String(companyId));
  formData.append("mapping", JSON.stringify(mapping));
  return spotJson<DebtImportValidateResponse>(`${DEBT_IMPORT_BASE_PATH}/validate`, {
    method: "POST",
    body: formData,
  });
}

export async function revalidateDebtImportData(
  data: Array<Record<string, string>>,
): Promise<DebtImportValidateResponse> {
  const companyId = getCurrentCompanyId();
  return spotJson<DebtImportValidateResponse>(`${DEBT_IMPORT_BASE_PATH}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, data }),
  });
}

export async function importDebts(
  data: Array<Record<string, string>>,
): Promise<DebtImportResult> {
  const companyId = getCurrentCompanyId();
  return spotJson<DebtImportResult>(DEBT_IMPORT_BASE_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, data }),
  });
}

