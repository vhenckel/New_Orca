import { useMutation, useQuery } from "@tanstack/react-query";

import {
  fetchDebtImportFields,
  importDebts,
  parseDebtImportCsv,
  revalidateDebtImportData,
  validateDebtImportCsv,
} from "@/modules/debt-negotiation/services";
import type {
  DebtImportFieldDefinition,
  DebtImportParseResponse,
  DebtImportValidateResponse,
  DebtImportResult,
} from "@/modules/debt-negotiation/types";

export function useDebtImportFields(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery<DebtImportFieldDefinition[]>({
    queryKey: ["debt-import", "fields"],
    queryFn: () => fetchDebtImportFields(),
    enabled,
  });
}

export function useDebtImportParse() {
  return useMutation<DebtImportParseResponse, Error, File>({
    mutationFn: (file) => parseDebtImportCsv(file),
  });
}

export function useDebtImportValidate() {
  return useMutation<DebtImportValidateResponse, Error, { file: File; mapping: Record<string, string> }>({
    mutationFn: ({ file, mapping }) => validateDebtImportCsv(file, mapping),
  });
}

export function useDebtImportRevalidate() {
  return useMutation<DebtImportValidateResponse, Error, Array<Record<string, string>>>({
    mutationFn: (data) => revalidateDebtImportData(data),
  });
}

export function useDebtImport() {
  return useMutation<DebtImportResult, Error, Array<Record<string, string>>>({
    mutationFn: (data) => importDebts(data),
  });
}

