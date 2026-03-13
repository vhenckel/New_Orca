import { getSpotApiHeaders, spotApiBaseUrl, getDefaultCompanyId } from "@/shared/config/env";
import type {
  DebtImportFieldDefinition,
  DebtImportParseResponse,
  DebtImportValidateResponse,
  DebtImportResult,
} from "@/modules/debt-negotiation/types";

const DEBT_IMPORT_BASE_PATH = "/renegotiation/import";

export async function fetchDebtImportFields(): Promise<DebtImportFieldDefinition[]> {
  const url = `${spotApiBaseUrl}${DEBT_IMPORT_BASE_PATH}/fields`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Debt import fields API error: ${res.status}`);
  }
  return res.json();
}

export async function parseDebtImportCsv(file: File): Promise<DebtImportParseResponse> {
  const companyId = getDefaultCompanyId();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", String(companyId));

  const url = `${spotApiBaseUrl}${DEBT_IMPORT_BASE_PATH}/parse`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "omit",
    headers: getSpotApiHeaders(),
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Debt import parse API error: ${res.status}`);
  }
  return res.json();
}

export async function validateDebtImportCsv(
  file: File,
  mapping: Record<string, string>,
): Promise<DebtImportValidateResponse> {
  const companyId = getDefaultCompanyId();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", String(companyId));
  formData.append("mapping", JSON.stringify(mapping));

  const url = `${spotApiBaseUrl}${DEBT_IMPORT_BASE_PATH}/validate`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "omit",
    headers: getSpotApiHeaders(),
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Debt import validate API error: ${res.status}`);
  }
  return res.json();
}

export async function revalidateDebtImportData(
  data: Array<Record<string, string>>,
): Promise<DebtImportValidateResponse> {
  const companyId = getDefaultCompanyId();
  const url = `${spotApiBaseUrl}${DEBT_IMPORT_BASE_PATH}/validate`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...getSpotApiHeaders(),
    },
    body: JSON.stringify({
      companyId,
      data,
    }),
  });
  if (!res.ok) {
    throw new Error(`Debt import revalidate API error: ${res.status}`);
  }
  return res.json();
}

export async function importDebts(
  data: Array<Record<string, string>>,
): Promise<DebtImportResult> {
  const companyId = getDefaultCompanyId();
  const url = `${spotApiBaseUrl}${DEBT_IMPORT_BASE_PATH}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...getSpotApiHeaders(),
    },
    body: JSON.stringify({
      companyId,
      data,
    }),
  });
  if (!res.ok) {
    throw new Error(`Debt import API error: ${res.status}`);
  }
  return res.json();
}

