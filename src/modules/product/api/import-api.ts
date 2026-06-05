import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";

export interface ImportProductsResponse {
  processId: string;
  message: string;
}

export interface ImportRowError {
  rows: number[];
  errors: string[];
}

export interface ImportProgress {
  id: string;
  progress: number;
  status: string;
  totalRows?: number;
  processedRows?: number;
  successRows?: number;
  rowErrors?: ImportRowError[];
  systemError?: string | null;
  isFinished: boolean;
}

export async function downloadImportTemplate(): Promise<void> {
  const blob = await apiRequestBlob("/import/products/template");
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "modelo-importacao-produtos.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function uploadProductsCsv(params: {
  file: File;
  establishmentId?: string;
}): Promise<ImportProductsResponse> {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.establishmentId) {
    formData.append("establishmentId", params.establishmentId);
  }
  return apiRequest<ImportProductsResponse>("/import/products", {
    method: "PUT",
    body: formData,
  });
}

export async function fetchImportStatus(processId: string): Promise<ImportProgress> {
  return apiRequest<ImportProgress>(`/import/status/${processId}`);
}

export async function fetchImportProgress(processId: string): Promise<ImportProgress> {
  return apiRequest<ImportProgress>(`/import/progress/${processId}`);
}
